package api

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"mime/multipart"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"sync"
	"time"

	"github.com/grafana/grafana/pkg/api/live"
	"github.com/grafana/grafana/pkg/infra/log"
	m "github.com/grafana/grafana/pkg/models"
	tsm "github.com/grafana/grafana/pkg/models-thingspin"
	"github.com/grafana/grafana/pkg/setting"
	r "github.com/serverhorror/rog-go/reverse"
)

var EAIM *EdgeAiManager

type EdgeAiManager struct {
	Settings       map[string]interface{}
	MsgSM          *live.StreamManager
	Mu             sync.Mutex
	log            log.Logger
	Cfg            *setting.Cfg
	basepath       string
	edgeAiFilePath string
}

func NewEdgeAiManager(cfg *setting.Cfg, stream *live.StreamManager) error {
	path := filepath.Join(cfg.DataPath, setting.EdgeAi.EdgeAi)
	EAIM = &EdgeAiManager{
		Settings:       make(map[string]interface{}),
		log:            log.New("thingspin.edge-ai"),
		Cfg:            cfg,
		MsgSM:          stream,
		basepath:       path,
		edgeAiFilePath: path + "/ml.json",
	}

	err := EAIM.LoadAllConf()
	if err != nil {
		return err
	}

	return nil
}

func (eai *EdgeAiManager) Delete(key string) {
	delete(eai.Settings, key)
}

func (eai *EdgeAiManager) Set(key string, data map[string]interface{}) {
	eai.Settings[key] = data
}

func (eai *EdgeAiManager) Get(key string) (map[string]interface{}, error) {
	item, ok := eai.Settings[key]
	if !ok {
		return nil, fmt.Errorf("The '%s' is not presented", key)
	}
	return item.(map[string]interface{}), nil
}

func (eai *EdgeAiManager) SetAll(data map[string]interface{}) {
	eai.Settings = data
}

func (eai *EdgeAiManager) GetAll() map[string]interface{} {
	return eai.Settings
}

func (eai *EdgeAiManager) LoadAllConf() (err error) {
	eai.Mu.Lock()
	defer eai.Mu.Unlock()
	// Make ml.json if it doesn't exist
	if _, err := os.Stat(eai.edgeAiFilePath); os.IsNotExist(err) {
		return fmt.Errorf("not exist : %s", err.Error())
	}

	b, err := ioutil.ReadFile(eai.edgeAiFilePath)
	if err != nil {
		return fmt.Errorf("not read ml.json : %s", err.Error())
	}

	jsonObj := map[string]interface{}{}
	err = json.Unmarshal(b, &jsonObj)
	if err != nil {
		return fmt.Errorf("not unmarshal ml.json : %s", err.Error())
	}
	// pid init
	for _, v := range jsonObj {
		v.(map[string]interface{})["pids"] = nil
	}
	eai.SetAll(jsonObj)
	eai.log.Info("LoadAllConf", "message", "Loaded all configuration about edge AI")
	return nil
}

func (eai *EdgeAiManager) StoreAllConf() (err error) {
	eai.Mu.Lock()
	defer eai.Mu.Unlock()
	items := eai.GetAll()
	// pid init
	for _, v := range items {
		item := v.(map[string]interface{})
		item["pids"] = nil
	}

	b, err := json.Marshal(items)
	if err != nil {
		return fmt.Errorf("not unmarshal ml.json : %s", err.Error())
	}
	// Refresh the DB file
	err = ioutil.WriteFile(eai.edgeAiFilePath, b, 0600)
	if err != nil {
		return fmt.Errorf("not write ml.json : %s", err.Error())
	}
	eai.log.Info("StoreAllConf", "message", "Stored all configuration about edge AI")
	return nil
}

func (eai *EdgeAiManager) EdgeAiGet(c *m.ReqContext) Response {
	eai.Mu.Lock()
	defer eai.Mu.Unlock()
	cid := c.Params("cid")

	itemMap, err := eai.Get(cid)
	if err != nil {
		return Error(500, "configuration : not found", nil)
	}

	return JSON(200, map[string]interface{}{
		"Success": true,
		"Result":  itemMap,
	})

}

func (eai *EdgeAiManager) EdgeAiGetAll(c *m.ReqContext) Response {
	eai.Mu.Lock()
	defer eai.Mu.Unlock()

	// Get all information without pids
	return JSON(200, map[string]interface{}{
		"Success": true,
		"Result":  eai.GetAll(),
	})
}

func (eai *EdgeAiManager) EdgeAiSave(c *m.ReqContext, req tsm.EdgeAiSaveReq) Response {
	eai.Mu.Lock()
	defer eai.Mu.Unlock()
	// ML Info
	var cid string = req.Cid

	var basepath string = eai.basepath + "/config/" + cid

	item, _ := eai.Get(cid)
	if item != nil {
		return Error(500, "cid already exists", nil)
	}

	// Make necessary directories for this config
	err := os.MkdirAll(basepath, os.ModePerm)
	if err != nil {
		return Error(500, "mkdirAll config dir: error", err)
	}
	err = os.MkdirAll(basepath+"/model", os.ModePerm)
	if err != nil {
		return Error(500, "mkdirAll model dir: error", err)
	}
	err = os.MkdirAll(basepath+"/algorithm", os.ModePerm)
	if err != nil {
		return Error(500, "mkdirAll algorithm dir: error", err)
	}

	var modelFiles []string
	var algorithmFiles []string
	var nerr *NormalResponse
	// Upload the model
	modelFiles, nerr = fileSave(basepath, "model", req.UploadModel)
	if nerr != nil {
		return nerr
	}

	// Upload the script
	algorithmFiles, nerr = fileSave(basepath, "algorithm", req.UploadAlgorithm)
	if nerr != nil {
		return nerr
	}

	obj := map[string]interface{}{
		"cid":            cid,
		"cname":          req.Cname,
		"pids":           nil,
		"model":          req.Model,
		"framework":      req.Framework,
		"mlSetting":      req.EdgeAiSetting,
		"algorithmName":  req.AlgorithmName,
		"algorithmType":  req.AlgorithmType,
		"algorithmFiles": algorithmFiles,
		"modelFiles":     modelFiles,
		"error":          "",
	}

	eai.Set(cid, obj)

	return Success("Successfully Saved")
}

func (eai *EdgeAiManager) start_getCommand(t string) string {
	switch t {
	case ".py":
		return "python"
	}
	return ""
}

func (eai *EdgeAiManager) createDebuggingLogFile(defaultPath string) (err error) {
	_, err = os.Stat(defaultPath + "/debug.log")
	if os.IsNotExist(err) {
		file, createErr := os.Create(defaultPath + "/debug.log")
		err = createErr
		file.Close()
	}
	return err
}

func (eai *EdgeAiManager) startStdoutScanner(c *m.ReqContext, stdout io.ReadCloser, debugFile *os.File) (err error) {
	// Reader stdout from the program
	var streamName string = "service_" + c.Params("cid")
	reader := bufio.NewReader(stdout)

	scanner := bufio.NewScanner(reader)

	var scanMsg string
	var ctime time.Time
	var ctimeString string
	var message *tsm.EdgeAiStreamMessage

	for scanner.Scan() {
		ctime = time.Now()
		ctimeString = ctime.Format("2006-01-02 15:04:05")
		scanMsg = scanner.Text()

		message = &tsm.EdgeAiStreamMessage{
			Stream: streamName,
			Data:   scanMsg,
		}

		// Push stdout to Websocket Server
		eai.MsgSM.PushToServiceStream(c, *message)
		if _, err = debugFile.WriteString(ctimeString + " - " + scanMsg + "\n"); err != nil {
			eai.log.Error("Failed to write scanMsg to debug.log", "error", err)
		}
	}

	if err = scanner.Err(); err != nil {
		ctime = time.Now()
		ctimeString = ctime.Format("2006-01-02 15:04:05")
		if _, err = debugFile.WriteString(ctimeString + " - " + err.Error() + "\n"); err != nil {
			eai.log.Error("Failed to write ScanErrMsg to debug.log", "error", err)
		}
	}

	return nil
}

func (eai *EdgeAiManager) startStderrScanner(c *m.ReqContext, stderr io.ReadCloser, debugFile *os.File) (errMessages string, err error) {
	// Reader stderr from the program
	var streamName string = "service_" + c.Params("cid")
	var errReader *bufio.Reader = bufio.NewReader(stderr)
	var errScanner *bufio.Scanner = bufio.NewScanner(errReader)

	var errMsg string
	var ctime time.Time
	var ctimeString string
	var message *tsm.EdgeAiStreamMessage

	errMessages = ""
	for errScanner.Scan() {
		ctime = time.Now()
		ctimeString = ctime.Format("2006-01-02 15:04:05")
		errMsg = errScanner.Text()

		message = &tsm.EdgeAiStreamMessage{
			Stream: streamName,
			Data:   errMsg,
		}

		if _, err = debugFile.WriteString(ctimeString + " - " + errMsg + "\n"); err != nil {
			eai.log.Error("Failed to write ScanErrMsg to debug.log", "error", err)
		}

		// Write Error Message
		if errMessages != "" {
			errMessages = errMessages + "\n" + errMsg
		} else {
			errMessages = errMsg
		}

		// Push stdout to Websocket Server
		eai.MsgSM.PushToServiceStream(c, *message)
	}

	if err = errScanner.Err(); err != nil {
		ctime = time.Now()
		ctimeString = ctime.Format("2006-01-02 15:04:05")
		if _, err = debugFile.WriteString(ctimeString + " - " + err.Error() + "\n"); err != nil {
			eai.log.Error("Failed to write ScanErrMsg to debug.log", "error", err)
		}
	}
	return errMessages, nil
}

func (eai *EdgeAiManager) publishWsMonitor(c *m.ReqContext, cid string, msg string) {
	message := &tsm.EdgeAiStreamMessage{
		Stream: "service_monitor",
		Data:   cid + " " + msg,
	}
	eai.MsgSM.PushToServiceStream(c, *message)
}

func (eai *EdgeAiManager) EdgeAiStart(c *m.ReqContext) Response {
	eai.Mu.Lock()
	defer eai.Mu.Unlock()

	var cid string = c.Params("cid")
	xargs, err := eai.Get(cid)
	if err != nil {
		return Error(500, "configuration not found", err)
	}

	if xargs["pids"] != nil {
		return Error(500, "the process is running", err)
	}

	// Get algorithm information
	var algorithmType string = xargs["algorithmType"].(string)
	var algorithmName string = xargs["algorithmName"].(string)

	var defaultPath string = eai.basepath + "/config/" + cid

	//var jsonParameter string
	cmd_args, _ := json.Marshal(xargs)

	// Get the command
	var cmdName string = eai.start_getCommand(algorithmType)

	// Create a file for debugging
	err = eai.createDebuggingLogFile(defaultPath)
	if err != nil {
		return Error(500, "debug.log : create error", err)
	}

	var fileFullpath = defaultPath + "/algorithm/" + algorithmName + algorithmType
	cmd := exec.Command(cmdName, "-u", fileFullpath, string(cmd_args)) //string(jsonParameterString))
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return Error(500, "cmd.StdoutPipe : error", err)
	}
	stderr, err := cmd.StderrPipe()
	if err != nil {
		return Error(500, "cmd.StderrPipe : error", err)
	}

	// Open the file
	debugFile, err := os.OpenFile(defaultPath+"/debug.log", os.O_APPEND|os.O_WRONLY, 0600)
	if err != nil {
		return Error(500, "Failed to open debug.log", err)
	}

	// go routine for scanning stdout from the program
	go func() {
		defer stdout.Close()

		err = eai.startStdoutScanner(c, stdout, debugFile)
		if err != nil {
			eai.log.Error("cmd.start_stdoutScanner", "error", err)
		}
	}()

	// go routine for scanning stderr from the program
	var errMessages string = ""
	go func() {
		defer stderr.Close()

		errMessages, err = eai.startStderrScanner(c, stderr, debugFile)
		if err != nil {
			eai.log.Error("cmd.start_stderrScanner", "error", err)
		}
	}()

	// Run the script
	err = cmd.Start()
	if err != nil {
		return Error(500, "cmd.Start : error", err)
	}
	var pid int = cmd.Process.Pid
	pids := xargs["pids"]
	if pids == nil {
		xargs["pids"] = []int{pid}
	} else {
		xargs["pids"] = append(pids.([]int), pid)
	}

	xargs["error"] = ""
	eai.Set(cid, xargs)

	// Wait for the child process
	go func() {

		// Monitor - started for browsers
		eai.publishWsMonitor(c, cid, "started")

		err := cmd.Wait()
		if err != nil {
			eai.log.Error("the main program checked that "+err.Error(), "error", err)
		}

		// Log message
		ctime := time.Now()
		ctimeString := ctime.Format("2006-01-02 15:04:05")
		if _, err = debugFile.WriteString(ctimeString + " - " + "The main program exited" + "\n"); err != nil {
			eai.log.Error("Failed to write exit message to debug.log", "error", err)
		}
		debugFile.Close()

		eai.log.Info("MLStart end", "pid", pid)

		xargs, err = eai.Get(cid)
		if err != nil {
			eai.log.Error("configuration not found", "error", err)
		} else {
			xargs["error"] = errMessages
			xargs["pids"] = nil
			eai.Set(cid, xargs)
			// Monitor - stopped for browsers
			eai.publishWsMonitor(c, cid, "stopped")
		}
	}()

	return Success("Successfully Started")
}

func (eai *EdgeAiManager) EdgeAiStop(c *m.ReqContext) Response {
	eai.Mu.Lock()
	defer eai.Mu.Unlock()
	cid := c.Params("cid")

	itemMap, err := eai.Get(cid)
	if err != nil {
		return Error(500, cid+" is not found", nil)
	}

	iPids := itemMap["pids"]
	if iPids == nil {
		return Error(500, "process may be not running", nil)
	}
	var pids = iPids.([]int)

	// kill all started main program
	var pid int
	for i := range pids {
		pid = pids[i]
		pc, _ := os.FindProcess(pid)
		if pc == nil {
			return Error(500, "os.FindProcess : error", err)
		}
		// Kill
		err = pc.Kill()
		if err != nil {
			return Error(500, "pc.Kill : error", err)
		}
		eai.log.Info("called the main promgram kill", "cid", cid, "pid", pid)
	}

	return Success("Successfully Stopped")
}

func (eai *EdgeAiManager) EdgeAiGetLogs(c *m.ReqContext) Response {
	eai.Mu.Lock()
	defer eai.Mu.Unlock()
	var defaultFilepath string = eai.basepath + "/config/" + c.Params("cid")

	// Exception
	xargs, err := eai.Get(c.Params("cid"))
	if err != nil {
		return Error(500, "configuration not found", err)
	}

	if xargs["pids"] != nil {
		return Error(500, "the process is running", err)
	}

	num, err := strconv.Atoi(c.Params("num"))
	if err != nil {
		return Error(500, "atoi : error", err)
	}

	// Create a file for debugging
	err = eai.createDebuggingLogFile(defaultFilepath)
	if err != nil {
		return Error(500, "debug.log : create error", err)
	}

	debugFile, err := os.Open(defaultFilepath + "/debug.log")
	if err != nil {
		return Error(500, "can't open the log file", err)
	}
	defer debugFile.Close()

	scanner := r.NewScanner(debugFile)

	var count int = 0
	var logs string = ""
	var msg string
	for scanner.Scan() {
		if count > num {
			break
		}
		msg = scanner.Text()
		if logs == "" {
			logs = msg
		} else {
			logs = msg + "\n" + logs
		}
		count += 1
	}

	if err := scanner.Err(); err != nil {
		return Error(500, "scanner error", err)
	}

	return JSON(200, map[string]interface{}{
		"log": logs,
	})
}

func (eai *EdgeAiManager) EdgeAiGetLog(c *m.ReqContext) Response {
	eai.Mu.Lock()
	defer eai.Mu.Unlock()
	var cid string = c.Params("cid")
	var basepath string = eai.basepath + "/config/" + cid

	// Exception
	xargs, err := eai.Get(cid)
	if err != nil {
		return Error(500, "configuration not found", err)
	}

	if xargs["pids"] != nil {
		return Error(500, "the process is running", err)
	}

	// Create a file for debugging
	err = eai.createDebuggingLogFile(basepath)
	if err != nil {
		return Error(500, "debug.log : create error", err)
	}

	b, err := ioutil.ReadFile(basepath + "/debug.log")
	if err != nil {
		return Error(500, "can't read the log file", err)
	}

	return JSON(200, map[string]interface{}{
		"log": string(b), //not running
	})
}

func (eai *EdgeAiManager) EdgeAiCheck(c *m.ReqContext) Response {
	eai.Mu.Lock()
	defer eai.Mu.Unlock()
	var cid string = c.Params("cid")

	itemMap, err := eai.Get(cid)
	if err != nil {
		return Error(500, cid+" not found", nil)
	}

	iPids := itemMap["pids"]
	var res map[string]interface{}
	if iPids != nil {
		var pids = iPids.([]int)

		var pid int
		for i := range pids {
			pid = pids[i]
			pc, _ := os.FindProcess(pid)

			if pc != nil {
				// pc is running
				res = map[string]interface{}{"CodeNum": 0}
				return JSON(200, res)
			}
		}

		// pc is not running
		itemMap["pids"] = nil
		eai.Set(cid, itemMap)

	}

	if itemMap["error"] == "" {
		//not running
		res = map[string]interface{}{"CodeNum": 1}
	} else {
		//error
		res = map[string]interface{}{"CodeNum": 2, "Error": itemMap["error"]}
	}
	return JSON(200, res)
}

func (eai *EdgeAiManager) EdgeAiUploadModel(c *m.ReqContext, req tsm.EdgeAiUploadReq) Response {
	var cid string = c.Params("cid")
	var fileName string = c.Params("fileName")
	var basepath = eai.basepath + "/config/" + cid

	file, err := req.EdgeAiFile.Open()
	if err != nil {
		return Error(500, "file open : error", err)
	}
	bs, err := ioutil.ReadAll(file)
	if err != nil {
		return Error(500, "file read : error", err)
	}

	err = ioutil.WriteFile(basepath+"/model/"+fileName, bs, 0600)
	if err != nil {
		return Error(500, "file write : error", err)
	}

	return Success("Successfully file Edited")
}

func (eai *EdgeAiManager) EdgeAiDownloadModel(c *m.ReqContext) []byte {
	var basepath = eai.basepath + "/config/" + c.Params("cid")

	var response tsm.FileGetContentRes
	dat, err := ioutil.ReadFile(basepath + "/model/" + c.Params("fileName"))
	if err != nil {
		c.JSON(500, response)
		return nil
	}

	return dat
}

func (eai *EdgeAiManager) EdgeAiUploadAl(c *m.ReqContext, req tsm.EdgeAiUploadReq) Response {
	var fileName string = c.Params("fileName")
	var basepath string = eai.basepath + "/config/" + c.Params("cid")

	file, err := req.EdgeAiFile.Open()
	if err != nil {
		return Error(500, "file open : error", err)
	}
	bs, err := ioutil.ReadAll(file)
	if err != nil {
		return Error(500, "file read : error", err)
	}

	err = ioutil.WriteFile(basepath+"/algorithm/"+fileName, bs, 0600)
	if err != nil {
		return Error(500, "file write : error", err)
	}

	return Success("Successfully file Edited")
}

func (eai *EdgeAiManager) EdgeAiDownloadAl(c *m.ReqContext) []byte {
	var fileName string = c.Params("fileName")
	var basepath = eai.basepath + "/config/" + c.Params("cid")

	var response tsm.FileGetContentRes
	dat, err := ioutil.ReadFile(basepath + "/algorithm/" + fileName)
	if err != nil {
		c.JSON(500, response)
		return nil
	}

	return dat
}

func (eai *EdgeAiManager) EdgeAiEdit(c *m.ReqContext, req tsm.EdgeAiSaveReq) Response {
	eai.Mu.Lock()
	defer eai.Mu.Unlock()

	// ML Info
	var cid string = req.Cid
	itemMap, err := eai.Get(cid)
	if err != nil {
		return Error(500, "configuration not found", err)
	}

	if itemMap["pids"] != nil {
		return Error(500, "the process is running", err)
	}

	dir, err := ioutil.TempDir(eai.basepath+"/config/", "")
	if err != nil {
		return Error(500, "tmp dir : error", err)
	}

	// Make necessary directories for this config
	err = os.MkdirAll(dir+"/model", os.ModePerm)
	if err != nil {
		err = os.RemoveAll(dir)
		if err != nil {
			return Error(500, "mkdirAll model dir & RemoveAll temp dir : error", err)
		}
		return Error(500, "mkdirAll model dir: error", err)
	}
	err = os.MkdirAll(dir+"/algorithm", os.ModePerm)
	if err != nil {
		err = os.RemoveAll(dir)
		if err != nil {
			return Error(500, "mkdirAll algorithm dir & RemoveAll temp dir : error", err)
		}
		return Error(500, "mkdirAll algorithm dir: error", err)
	}

	// Upload the model
	modelFiles, nerr := fileSave(dir, "model", req.UploadModel)
	if err != nil {
		err = os.RemoveAll(dir)
		if err != nil {
			return Error(500, "Upload the model & RemoveAll temp dir : error", err)
		}
		return nerr
	}

	// Upload the script
	algorithmFiles, nerr := fileSave(dir, "algorithm", req.UploadAlgorithm)
	if err != nil {
		err = os.RemoveAll(dir)
		if err != nil {
			return Error(500, "Upload the script & RemoveAll temp dir : error", err)
		}
		return nerr
	}

	// Delete the config info including all childs from the file system
	err = os.RemoveAll(eai.basepath + "/config/" + cid)
	if err != nil {
		err = os.RemoveAll(dir)
		if err != nil {
			return Error(500, "RemoveAll configuration dir & RemoveAll temp dir : error", err)
		}
		return Error(500, "removeAll configuration dir : error", err)
	}

	obj := map[string]interface{}{
		"cid":           cid,
		"cname":         req.Cname,
		"model":         req.Model,
		"framework":     req.Framework,
		"mlSetting":     req.EdgeAiSetting,
		"algorithmName": req.AlgorithmName,
		"algorithmType": req.AlgorithmType,

		"pids":           nil,
		"modelFiles":     modelFiles,
		"algorithmFiles": algorithmFiles,
	}

	err = os.Rename(dir, eai.basepath+"/config/"+cid)
	if err != nil {
		var changedCid string = filepath.Dir(dir)
		eai.Delete(cid)

		eai.Set(changedCid, obj)
		return Error(500, "rename happened. the cid changed : ", err)
	}

	eai.Set(cid, obj)

	return Success("Successfully Edited")
}

func (eai *EdgeAiManager) EdgeAiDelete(c *m.ReqContext) Response {
	eai.Mu.Lock()
	defer eai.Mu.Unlock()
	var cid string = c.Params("cid")

	itemMap, err := eai.Get(cid)
	if err != nil {
		return Error(500, "Configuration not found", nil)
	}

	iPids := itemMap["pids"]
	if iPids != nil {
		var pids = iPids.([]int)

		var pid int
		for i := range pids {
			pid = pids[i]
			pc, _ := os.FindProcess(pid)

			if pc != nil {
				return Error(500, "the process is running", nil)
			}
		}

	}

	eai.Delete(cid)

	// Delete the config info including all childs from the file system
	err = os.RemoveAll(eai.basepath + "/config/" + cid)
	if err != nil {
		return Error(500, "removeAll configuration dir : error", err)
	}

	return Success("Successfully Deleted")
}

func fileSave(basepath string, target string, files []*multipart.FileHeader) ([]string, *NormalResponse) {
	var filenames []string

	for _, fh := range files {
		file, err := fh.Open()
		if err != nil {
			return nil, Error(500, "uploded "+target+" file open : error", err)
		}
		bs, err := ioutil.ReadAll(file)
		if err != nil {
			return nil, Error(500, "uploaded "+target+" file read : error", err)
		}
		err = ioutil.WriteFile(basepath+"/"+target+"/"+fh.Filename, bs, 0600)
		if err != nil {
			return nil, Error(500, "uploaded "+target+" file write : error", err)
		}
		filenames = append(filenames, fh.Filename)
		file.Close()
	}

	return filenames, nil
}

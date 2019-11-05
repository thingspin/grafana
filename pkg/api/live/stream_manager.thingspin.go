package live

import (
	"github.com/grafana/grafana/pkg/components/simplejson"
	m "github.com/grafana/grafana/pkg/models"
	tsm "github.com/grafana/grafana/pkg/models-thingspin"
)

func (sm *StreamManager) TsPush(packet *tsm.TsStreamPacket) {
	// get connected websocket clients(streams)
	subscribers, exists := sm.hub.streams[packet.Stream]

	// empty checker
	if !exists || len(subscribers) == 0 {
		return
	}

	// message convert
	messageBytes, _ := simplejson.NewFromAny(packet).Encode()

	// send message to stream
	for sub := range subscribers {
		if _, ok := sm.hub.connections[sub]; ok {
			sub.send <- messageBytes
		}
	}
}

func (sm *StreamManager) PushToServiceStream(c *m.ReqContext, message tsm.EdgeAiStreamMessage) {
	sm.hub.edgeAiChannel <- &message
}

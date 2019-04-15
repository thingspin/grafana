
ThingSPIN OPCUA Data Connect Documents
===

개요
---

- 본 문서에서는 데이터 관리에서 사용하는 Node-Red Flow Template 사용법을 정의합니다.
- 그 중 OPC/UA Flow에서 필요한 데이터가 무엇이 필요한지 아래에 정의합니다.

Data Structure
------

1. Golang(pkg/models-thingspin/node-red.go)

    ```go
    type OpcUaAddressSpaceItem struct {
        Name         string `json:"name"`
        NodeId       string `json:"nodeId"`
        DatatypeName string `json:"datatypeName"`
    }

    type OpcUaFlowData struct {
        FlowId            string
        EndpointUrl       string
        AddressSpaceItems []OpcUaAddressSpaceItem
        Interval          float32
    }
    ```

2. Typescript

    ```typescript
    interface AddressSpaceItem {
        name:         string,
        nodeId:       string,
        datatypeName: string,
    }

    interface OpcUaFlowData {
        FlowId:            string,
        EndpointUrl:       string,
        AddressSpaceItems: []AddressSpaceItem,
        Interval:          float,
    }
    ```

Examples
---------------------

- 본 내용은 개발자가 이해하기 쉽게 작성한 샘플 내용입니다.
- 이대로 Ctrl+c / Ctrl+v 하시면 안됩니다.

1. Backend (Golang)

    ```go
    import (
        m "github.com/grafana/grafana/pkg/models-thingspin"
        "github.com/grafana/grafana/pkg/thingspin"
    )
    var addressItems []m.OpcUaAddressSpaceItem
    addressItems = append(addressItems, m.OpcUaAddressSpaceItem{
        Name:         "sample",
        NodeId:       "ns=0;i=85",
        DatatypeName: "sample",
    })

    opcData := m.OpcUaFlowData{
        FlowId: "test",
        EndpointUrl: "opc.tcp://localhost:53530/OPCUA/SimulationServer",
        AddressSpaceItems: addressItems,
        Interval: 0.5, // 500 miliseconds
    }

    thingspin.AddFlowNode("opcua", opcData)
    ```

2. Frontend (ES6) - Promise

    ```javascript
    import axios from "axios"; // promise based http client open source library

    axios.post('/thingspin/flow-node/opcua', {
        FlowId: "sample",
        EndPointUrl: "opc.tcp://localhost:53530/OPCUA/SimulationServer",
        AddressSpaceItems: [{
            name: "sample",
            nodeId: "ns=0;i=85",
            datatypeName: "sample"
        }],
        Interval: 1 // 1 second
    }).then( (response) => {
        // 데이터를 정상적으로 가져왔을 경우 처리
    }).catch( (error) => {
        // 요청에 요류가 있는 경우 처리
    });
    ```

3. Frontend (ES7) - async, await

    ```javascript
    import axios from "axios"; // promise based http client open source library

    const readExample = async () => {
        return axios.post('/thingspin/flow-node/opcua', {
            FlowId: "sample",
            EndPointUrl: "opc.tcp://localhost:53530/OPCUA/SimulationServer",
            AddressSpaceItems: [{
                name: "sample",
                nodeId: "ns=0;i=85",
                datatypeName: "sample"
            }],
            Interval: 1 // 1 second
        });
    }

    // ...
    try{
        const response = await readExample();
        // 데이터 정상적으로 가져왔을 경우 처리
    } catch(e) {
        // 요청에 오류가 있는 경우 처리
    }

    ```
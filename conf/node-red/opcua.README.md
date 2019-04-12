
ThingSPIN OPCUA Data Connect Documents
===

개요
---

 - 본 문서에서는 데이터 관리에서 사용하는 Node-Red Flow Template 사용법을 정의합니다.
 - 그 중에 OPC/UA Flow에서 필요한 데이터가 무엇이 필요한지 아래에 정의합니다.

```javascript
{
    FlowId: "Backend 에서 생성이 필요",
    EndpointUrl: "OPC/UA Endpoint URL",
    AddressSpaceItems: `배열`,
}
```

Source
------

- pkg/models-thingspin/node-red.go

```go
type OpcUaFlowData struct {
    FlowId      string
    EndpointUrl string
    AddressSpaceItems string
}
```

Backend(Golang) example
---------------------

- 본 내용은 개발자가 이해하기 쉽게 작성한 샘플 내용입니다.
- 이대로 Ctrl+c / Ctrl+v 하시면 안됩니다.

```go
import (
    m "github.com/grafana/grafana/pkg/models-thingspin"
    "github.com/grafana/grafana/pkg/thingspin"
)

opcData := m.OpcUaFlowData{
    FlowId: "test",
    EndpointUrl: "opc.tcp://localhost:53530/OPCUA/SimulationServer",
    AddressSpaceItems: `[{
        "name":"sample",
        "nodeId": "ns=0;i=85",
        "datatypeName": "sample"
    }]`
}

thingspin.AddFlowNode("opcua", opcData)
```
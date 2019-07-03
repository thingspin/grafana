package api

import (
	m "github.com/grafana/grafana/pkg/models-thingspin"
)

func (hs *HTTPServer) TsSendStream(packet *m.TsStreamPacket) {
	hs.streamManager.TsPush(packet)
}
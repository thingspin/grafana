package live

import (
	"github.com/grafana/grafana/pkg/components/simplejson"
	m "github.com/grafana/grafana/pkg/models-thingspin"
)

func (s *StreamManager) TsPush(packet *m.TsStreamPacket) {
	// get connected websocket clients(streams)
	subscribers, exists := s.hub.streams[packet.Stream]

	// empty checker
	if !exists || len(subscribers) == 0 {
		s.log.Info("Message to stream without subscribers", "stream", packet.Stream)
		return
	}

	// message convert
	messageBytes, _ := simplejson.NewFromAny(packet).Encode()

	// send message to stream
	for sub := range subscribers {
		sub.send <- messageBytes
	}
}
ThingSPIN Development Docker Compose
===

- 본 문서는 ThingSPIN에서 동작하기 위해 기존에 설치되있어야 할 프로그램(Application)을 관리합니다.
- 어디까지나 개발에 목적이 있으며, 배포용으로 사용하지 않습니다.

기본 개념
---

해당 문서에서는 사용할 기술에 대해 자세한 언급을 하지 않습니다.

자세한 내용은 아래의 기술을 숙지하시길 권장합니다.

1. docker
2. docker-compose

구성
---

1. MQTT Broker(Eclipse Mosquitto)
2. Node-Red
3. InfluxDB

사용법
---

현재 디렉토리에서 다음과 같은 명령어를 사용한다.

```bash
docker-compose up -d
```
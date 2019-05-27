-include local/Makefile

.PHONY: all deps-go deps-js deps build-go build-server build-cli build-js build build-docker-dev build-docker-full lint-go test-go test-js test run clean gosec revive devenv devenv-down

GO := GO111MODULE=on go
GO_FILES := ./pkg/...

all: deps build

deps-go:
	go run build.go setup

deps-js: node_modules

deps: deps-js

build-go:
	@echo "build go files"
	GO111MODULE=on go run build.go build

build-server:
	@echo "build server"
	GO111MODULE=on go run build.go build-server

build-cli:
	@echo "build in CI environment"
	GO111MODULE=on go run build.go build-cli

build-js:
	@echo "build frontend"
	yarn run build

build: build-go build-js

build-docker-dev:
	@echo "build development container"
	@echo "\033[92mInfo:\033[0m the frontend code is expected to be built already."
	GO111MODULE=on go run build.go -goos linux -pkg-arch amd64 ${OPT} build pkg-archive latest
	cp dist/grafana-latest.linux-x64.tar.gz packaging/docker
	cd packaging/docker && docker build --tag grafana/grafana:dev .

build-docker-full:
	@echo "build docker container"
	docker build --tag grafana/grafana:dev .

lint-go:
	@echo "lint go source"
	scripts/backend-lint.sh

test-go:
	@echo "test backend"
	GO111MODULE=on go test -v ./pkg/...

test-js:
	@echo "test frontend"
	yarn test

test: test-go test-js

run:
	@echo "start a server"
	./bin/grafana-server

clean:
	@echo "cleaning"
	rm -rf node_modules
	rm -rf public/build

node_modules: package.json yarn.lock
	@echo "install frontend dependencies"
	yarn install --pure-lockfile --no-progress

scripts/go/bin/revive: scripts/go/go.mod
	@cd scripts/go; \
	$(GO) build -o ./bin/revive github.com/mgechev/revive

scripts/go/bin/gosec: scripts/go/go.mod
	@cd scripts/go; \
	$(GO) build -o ./bin/gosec github.com/securego/gosec/cmd/gosec

revive: scripts/go/bin/revive
	@scripts/go/bin/revive \
		-formatter stylish \
		-config ./scripts/go/configs/revive.toml \
		$(GO_FILES)

# create docker-compose file with provided sources and start them
# example: make devenv sources=postgres,openldap
devenv: devenv-down
	$(eval targets := $(shell echo '$(sources)' | tr "," " "))

	@cd devenv; \
	./create_docker_compose.sh $(targets); \
	docker-compose up -d

# drop down the envs
devenv-down:
	@cd devenv; docker-compose down;

# TODO recheck the rules and leave only necessary exclusions
gosec: scripts/go/bin/gosec
	@scripts/go/bin/gosec -quiet \
		-exclude=G104,G107,G201,G202,G204,G301,G304,G401,G402,G501 \
		-conf=./scripts/go/configs/gosec.json \
		$(GO_FILES)

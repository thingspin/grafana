# ThingSPIN 툴킷

아래의 모든 작업을 수행하기 전에 아래의 명령어를 수행해야합니다.

```bash
yarn install
```

그렇지 않으면 `thingspin-toolkit` 이라는 명령이 알 수 없는 명령이라며 오류가 표시 될 것이며, 개발자는 이 원인을 추적 하면서 많은 시간을 할애할 것입니다.

## 내부 개발

내부 개발자는 신규 packages를 개발할 때 다음과 같은 방법을 사용하세요.

1. 개발자는 새로 개발될 pakcges 디렉토리(예를 들어, packages/thingspin-toolkit/) 디렉토리에 이동하세요.
2. 두번쨰로 `yarn link` 라는 명령을 수행하세요.
3. 그러면 `yarn link @thingspin/toolkit`을 사용하여 링크 된 버전을 사용 할 수 있습니다.
4. 마지막으로 thingspin 빌드 환경 디렉토리(src/github.com/grafana/grafana)로 이동하여 `yarn install`을 수행하면 어디서든지 별도의 모듈로 개발이 가능 할 것입니다.

## ThingSPIN extensions development with thingspin-toolkit overview

### Typescript

To configure Typescript create `tsconfig.json` file in the root dir of your app. grafana-toolkit comes with default tsconfig located in `packages/grafana-toolkit/src/config/tsconfig.plugin.ts`. In order for Typescript to be able to pickup your source files you need to extend that config as follows:

```json
{
  "extends": "./node_modules/@grafana/toolkit/src/config/tsconfig.plugin.json",
  "include": ["src"],
  "compilerOptions": {
    "rootDir": "./src",
    "typeRoots": ["./node_modules/@types"]
  }
}
```

### TSLint

grafana-toolkit comes with default config for TSLint, that's located in `packages/grafana-toolkit/src/config/tslint.plugin.ts`. As for now there is now way to customise TSLint config.

### Tests

grafana-toolkit comes with Jest as a test runner. It runs tests according to common config locted in `packages/grafana-toolkit/src/config/jest.plugin.config.ts`.

For now the config is not extendable, but our goal is to enable custom jest config via jest.config or package.json file. This might be required in the future if you want to use i.e. `enzyme-to-json` snapshots serializer. For that particular serializer we can also utilise it's API and add initialisation in the setup files (<https://github.com/adriantoine/enzyme-to-json#serializer-in-unit-tests>). We need to test that approach first.

#### Jest setup

We are not opinionated about tool used for implmenting tests. Internally at Grafana we use Enzyme. If you want to configure Enzyme as a testing utility, you need to configure enzyme-adapter-react. To do so, you need to create `[YOUR_APP]/config/jest-setup.ts` file that will provide React/Enzyme setup. Simply copy following code into that file to get Enzyme working with React:

```ts
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });
```

grafana-toolkit will use that file as Jest's setup file. You can also setup Jest with shims of your needs by creating `jest-shim.ts` file in the same directory: `[YOUR_APP]/config/jest-shim.ts`

Adidtionaly, you can also provide additional Jest config via package.json file. For more details please refer to [Jest docs](https://jest-bot.github.io/jest/docs/configuration.html#verbose-boolean). Currently we support following properties:

- [`snapshotSerializers`](https://jest-bot.github.io/jest/docs/configuration.html#snapshotserializers-array-string)

## Prettier [todo]

## Development mode [todo]

TODO

- Enable rollup watch on extension sources

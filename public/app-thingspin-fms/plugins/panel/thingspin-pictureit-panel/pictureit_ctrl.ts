// js 3rd party libs
import _ from 'lodash';
// copied 3rd party libs
const sprintf = require('./sprintf').sprintf;
import './angular-sprintf.js';

// Grafana libs
import { PanelEvents } from '@grafana/data';
import { MetricsPanelCtrl } from 'app/plugins/sdk';

// thingspin libs
import { RecievedData, PictureItPanelData, Sensor, TsImage, ImageMap } from './types';

const pixelStrToNum = (str: string) => parseInt(str.substr(0, str.length - 2), 10);

export class ThingspinPictureItCtrl extends MetricsPanelCtrl {
  static templateUrl: string = require('./module.html');

  private $panel: JQLite;

  /** @ngInject */
  constructor($scope: angular.IScope, $injector: angular.auto.IInjectorService) {
    super($scope, $injector);
    _.defaults(this.panel, {
      valueMaps: [],
      seriesList: [],
      series: [],
      bgimage: '',
      sensors: [],
      images: [],
      height: '400px',
      width: '100px',
      bgtype: 'cover',
    });

    this.events.on(PanelEvents.editModeInitialized, this.onInitEditMode);
    this.events.on(PanelEvents.dataReceived, this.onDataReceived);
    this.events.on(PanelEvents.dataSnapshotLoad, this.onDataReceived);
  }

  onInitEditMode = () => {
    const path: string = require('./editor.html');
    this.addEditorTab('Options', path, 2);
  };

  onDataReceived = (dataList: RecievedData[]) => {
    const panel: PictureItPanelData = this.panel;

    panel.valueMaps = dataList.map(({ target, datapoints }) => ({
      name: target,
      value: datapoints[datapoints.length - 1][0],
    }));

    this.render();
  };

  deleteSensor(index: number) {
    this.panel.sensors.splice(index, 1);
  }

  deleteImage(index: number) {
    this.panel.images.splice(index, 1);
  }

  addSensor() {
    const { sensors }: PictureItPanelData = this.panel;

    let sensor: Sensor;
    if (!sensors.length) {
      sensor = {
        name: 'A-series',
        xlocation: 200,
        ylocation: 200,
        format: '%.2f',
        bgcolor: 'rgba(0, 0, 0, 0.58)',
        color: '#FFFFFF',
        size: 22,
        bordercolor: 'rgb(251, 4, 4)',
        visible: true,
      };
    } else {
      const { name, format, bgcolor, color, size, bordercolor } = sensors[sensors.length - 1];
      sensor = {
        name,
        format,
        bgcolor,
        color,
        size,
        bordercolor,
        visible: true,
        xlocation: 200,
        ylocation: 200,
      };
    }

    sensors.push(sensor);
  }

  addImage() {
    const { images }: PictureItPanelData = this.panel;

    images.push({
      name: 'A-series',
      xlocation: 200,
      ylocation: 200,
      size: 50,
      visible: true,
      imageMaps: []
    });
  }

  removeImageMap(image: TsImage, map: ImageMap) {
    const { images }: PictureItPanelData = this.panel;

    const idx = images.findIndex(({ name }) => name === image.name);
    if (idx !== -1) {
      const { imageMaps } = images[idx];
      const index = _.indexOf(imageMaps, map);
      imageMaps.splice(index, 1);
    }

    this.render();
  }

  addImageMap(image: TsImage) {
    const { images }: PictureItPanelData = this.panel;

    const idx = images.findIndex(({ name }) => name === image.name);
    if (idx !== -1) {
      images[idx].imageMaps.push({ name: 'A-series', value: '', op: '=', text: '', visible: true });
    }
  }

  setValueMapping() { }

  onImageDrag(image: TsImage, { offsetX, offsetY }: any) {
    image.xlocation = image.xlocation + offsetX;
    image.ylocation = image.ylocation + offsetY;

    image.xlocationStr = `${image.xlocation}px`;
    image.ylocationStr = `${image.ylocation}px`;
  }

  onSensorDrag(sensor: Sensor, { offsetX, offsetY }: any) {
    sensor.xlocation = sensor.xlocation + offsetX;
    sensor.ylocation = sensor.ylocation + offsetY;

    sensor.xlocationStr = `${sensor.xlocation}px`;
    sensor.ylocationStr = `${sensor.ylocation}px`;
  }

  onDrop() { }

  onRender = () => {
    const { sensors, valueMaps, images }: PictureItPanelData = this.panel;
    if (!sensors && !images) {
      return;
    }

    const width = pixelStrToNum(this.$panel.css("width"));
    const height = pixelStrToNum(this.$panel.css("height"));

    for (const sensor of sensors) {
      const { xlocation, ylocation, size, format } = sensor;

      sensor.visible = xlocation < width && ylocation < height;
      sensor.ylocationStr = `${ylocation}px`;
      sensor.xlocationStr = `${xlocation}px`;
      sensor.sizeStr = `${size}px`;

      const idx = valueMaps.findIndex(({ name }) => name === sensor.name);
      if (idx !== -1) {
        sensor.valueFormatted = sprintf(format, valueMaps[idx].value);
      }
    }

    for (const image of images) {
      const { xlocation, ylocation, size, imageMaps } = image;

      image.visible = xlocation < width && ylocation < height;
      image.ylocationStr = `${ylocation}px`;
      image.xlocationStr = `${xlocation}px`;
      image.sizeStr = `${size}px`;

      const idx = valueMaps.findIndex(({ name }) => name === image.name);
      if (idx !== -1) {
        const imgIdx = imageMaps.findIndex(({ value }) => value === valueMaps[idx].value);
        if (imgIdx !== -1) {
          image.imageInserted = imageMaps[imgIdx].text;
        }
      }
    }
  }

  link(scope: angular.IScope, elem: JQLite) {
    this.$panel = elem.find('.panel-container');

    this.events.on(PanelEvents.render, () => {
      this.onRender();
      this.renderingCompleted();
    });
  }
}

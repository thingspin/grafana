
export interface PictureItPanelData {
  sensors: Sensor[];
  seriesList: any[];
  valueMaps: ValueMap[];
  images: TsImage[];
  bgimage: string;
  series: any[];
  height: string;
  width: string;
  bgtype: string;
}

export interface ValueMap {
  name: string;
  value: any;
}

export interface ImageMap {
  name: string;
  value: string;
  op: string;
  text: string;
  visible: boolean;
}

export interface BaseData {
  name: string;
  xlocation: number;
  ylocation: number;
  size: number;
  visible: boolean;

  xlocationStr?: string;
  ylocationStr?: string;
  sizeStr?: string;
}

export interface Sensor extends BaseData {
  format: string;
  bgcolor: string;
  color: string;
  bordercolor: string;

  valueFormatted?: string;
}

export interface TsImage extends BaseData {
  imageMaps: ImageMap[];

  imageInserted?: string;
}

export interface RecievedData {
  target: string;
  datapoints: any[][];
}

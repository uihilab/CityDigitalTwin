const ModelMilkTruck = `${process.env.PUBLIC_URL}/data/CesiumMilkTruck.glb`;
const ModelCarGreen = `${process.env.PUBLIC_URL}/data/car_green.glb`;
const ModelBus = `${process.env.PUBLIC_URL}/data/Old_Rusty_Bus.glb`;
const ModelBusSchool = `${process.env.PUBLIC_URL}/data/school_bus.glb`;
const ModelTrainLocomotive = `${process.env.PUBLIC_URL}/data/train/locomotive.glb`;
const ModelTrainCar = `${process.env.PUBLIC_URL}/data/train/wagon.glb`;

const modelUrls = {
  car: { modelUrl: ModelCarGreen, sizeScale: 20 },
  bus: { modelUrl: ModelBus, sizeScale: 20 },
  trainLocomotive: { modelUrl: ModelTrainLocomotive, sizeScale: 15 },
  trainCar: { modelUrl: ModelTrainCar, sizeScale: 0.10 },
  default: { modelUrl: ModelCarGreen, sizeScale: 20 },
};

export default modelUrls;

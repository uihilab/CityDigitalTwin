/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

/** 
  All of the routes for the Material Dashboard 2 React are added here,
  You can add a new route, customize the routes and delete the routes here.

  Once you add a new route on this file it will be visible automatically on
  the Sidenav.

  For adding a new route you can follow the existing routes in the routes array.
  1. The `type` key with the `collapse` value is used for a route.
  2. The `type` key with the `title` value is used for a title inside the Sidenav. 
  3. The `type` key with the `divider` value is used for a divider between Sidenav items.
  4. The `name` key is used for the name of the route on the Sidenav.
  5. The `key` key is used for the key of the route (It will help you with the key prop inside a loop).
  6. The `icon` key is used for the icon of the route on the Sidenav, you have to add a node.
  7. The `collapse` key is used for making a collapsible item on the Sidenav that has other routes
  inside (nested routes), you need to pass the nested routes inside an array as a value for the `collapse` key.
  8. The `route` key is used to store the route location which is used for the react router.
  9. The `href` key is used to store the external links location.
  10. The `title` key is only for the item with the type of `title` and its used for the title text on the Sidenav.
  10. The `component` key is used to store the component of its route.
*/

// Material Dashboard 2 React layouts

// @mui icons
import Icon from "@mui/material/Icon";

const layers = [
  {
    type: "collapse",
    name: "Infrastructure",
    key: "C_Infrastructure",
    icon: <Icon fontSize="small">Infrastructure Data</Icon>,
    collapse: [
      {
        type: "maplayer",
        name: "Buildings",
        key: "Buildings",
        dataPath: `${process.env.PUBLIC_URL}/data/waterloo_buildings.geojson`,
      },
      {
        type: "maplayer",
        name: "Bridges",
        key: "Bridges",
        status: false,
        dataPath: `${process.env.PUBLIC_URL}/data/iowa_bridges.geojson`,
      },
      {
        type: "maplayer",
        name: "Bicycle Amenities",
        key: "BicycleAmenities",
        status: false,
      },
      {
        type: "maplayer",
        name: "Railway Crossing",
        key: "RailwayCross",
        status: false,
        icon: <Icon fontSize="small">Railway Crossing</Icon>,
        dataPath: `${process.env.PUBLIC_URL}/data/Rail_Crossing.geojson`,
      },
      {
        type: "maplayer",
        name: "Railway Bridge",
        key: "RailBridge",
        status: false,
        icon: <Icon fontSize="small">Railway Bridges</Icon>,
        dataPath: `${process.env.PUBLIC_URL}/data/railwaybridge.geojson`,
      },
      {
        type: "maplayer",
        name: "Electric Power Plants",
        key: "Electricpower",
        status: true,
        icon: <Icon fontSize="small">Electric power</Icon>,
        dataPath: `${process.env.PUBLIC_URL}/data/electiricpowerfacilities.geojson`,
      },
      // {
      //   type: "maplayer",
      //   name: "Electric grid",
      //   key: "Electricgrid",
      //   status: true,
      //   icon: <Icon fontSize="small">Electric grid</Icon>,
      //   dataPath: `${process.env.PUBLIC_URL}/data/PowerPlants.json`,
      // },
      {
        type: "maplayer",
        name: "Waste Water TP",
        key: "wastewater",
        icon: <Icon fontSize="small">WasteWater</Icon>,
        dataPath: `${process.env.PUBLIC_URL}/data/wastewater.geojson`,
      },
      {
        type: "maplayer",
        name: "Groundwater Wells",
        key: "wells",
        icon: <Icon fontSize="small">Well</Icon>,
      },
    ],
  },
  {
    type: "divider",
    key: "divide1",
    name: "divide1",
  },
  {
    type: "collapse",
    name: "Weather & Environment",
    key: "C_WE",
    icon: <Icon fontSize="small">Weather Environment</Icon>,
    collapse: [
      {
        type: "maplayer",
        name: "Weather Forecast",
        key: "WForecast",
        icon: <Icon fontSize="small">Weather Forecast</Icon>,
        dataPath:
          "https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m",
      },
      {
        type: "maplayer",
        name: "Air Quality Data",
        key: "AQuality",
        icon: <Icon fontSize="small">Air quality</Icon>,
      },
      {
        type: "maplayer",
        name: "Drought Maps",
        key: "Drought",
        icon: <Icon fontSize="small">Drought</Icon>,
      },
      {
        type: "maplayer",
        name: "Flood Maps",
        key: "Flood",
        icon: <Icon fontSize="small">Flood</Icon>,
      },
      // {
      //   type: "maplayer",
      //   name: "Rain Gauges",
      //   key: "RainGauges",
      //   icon: <Icon fontSize="small">Rain</Icon>,
      // },
      {
        type: "maplayer",
        name: "Stream Gauges",
        key: "StreamGauges",
        icon: <Icon fontSize="small">Steam</Icon>,
      },
      {
        type: "maplayer",
        name: "Soil Moisture Gauges",
        key: "SoilMoistureSensors",
        icon: <Icon fontSize="small">Soil Moisture</Icon>,
      },
    ],
  },
  {
    type: "divider",
    key: "divide2",
    name: "divide2",
  },
  {
    type: "collapse",
    name: "Transportation",
    key: "C_Transportation",
    icon: <Icon fontSize="small">Transportation</Icon>,
    collapse: [
      {
        type: "maplayer",
        name: "Road",
        key: "RoadNetworks",
        dataPath: `${process.env.PUBLIC_URL}/data/highway_waterloo.geojson`,
      },
      {
        type: "collapse",
        name: "Public Transit",
        key: "PublicTransitRoutes",
        icon: <Icon fontSize="small">Transit</Icon>,
        collapse: [
          {
            type: "maplayer",
            name: "Railway Network",
            key: "Train_Info",
            icon: <Icon fontSize="small">Train</Icon>,
          },
          {
            type: "maplayer",
            name: "Bus Stops",
            key: "Bus_Stops",
            icon: <Icon fontSize="small">Bus</Icon>,
          },
          {
            type: "maplayer",
            name: "Bus Routes",
            key: "Bus_Routes",
            icon: <Icon fontSize="small">Bus</Icon>,
          },
        ],
      },
      {
        type: "maplayer",
        name: "Bicycle",
        key: "BicycleNetwork",
        icon: <Icon fontSize="small">Bicycle</Icon>,
        //dataPath:
        //"https://services.arcgis.com/8lRhdTsQyJpO52F1/ArcGIS/rest/services/City_View/FeatureServer/0/query?f=geojson&where=1%3D1&returnGeometry=true&spatialRel=esriSpatialRelIntersects&outFields=*&maxRecordCountFactor=2&outSR=102100&resultOffset=0&resultRecordCount=4000&cacheHint=true&quantizationParameters=%7B%22mode%22%3A%22view%22%2C%22originPosition%22%3A%22upperLeft%22%2C%22tolerance%22%3A1.058335450004216%2C%22extent%22%3A%7B%22xmin%22%3A-10754630.6656625%2C%22ymin%22%3A4921060.191306702%2C%22xmax%22%3A-10036824.38723184%2C%22ymax%22%3A5388520.414925002%2C%22spatialReference%22%3A%7B%22wkid%22%3A102100%2C%22latestWkid%22%3A3857%7D%7D%7D",
      }
    ],
  },
  {
    type: "divider",
    key: "divide3",
    name: "divide4",
  },
  {
    type: "collapse",
    name: "Public Services",
    key: "C_PublicServices",
    icon: <Icon fontSize="small">Public Services</Icon>,
    collapse: [
      {
        type: "maplayer",
        name: "Demographic Data",
        key: "DemographicHousingData",
        dataPath:
          "https://data.census.gov/api/profile/content/topic?g=050XX00US19013&infoSection=Age%20and%20Sex",
      },
      {
        type: "maplayer",
        name: "School",
        key: "School",
        icon: <Icon fontSize="small">School</Icon>,
        dataPath: `${process.env.PUBLIC_URL}/data/Ameties_School.geojson`,
      },
      {
        type: "maplayer",
        name: "Police Stations",
        key: "PoliceStations",
        icon: <Icon fontSize="small">Police Stations</Icon>,
        dataPath: `${process.env.PUBLIC_URL}/data/policestation.geojson`,
      },
      {
        type: "maplayer",
        name: "Fire Stations",
        key: "FireStations",
        icon: <Icon fontSize="small">Fire Stations</Icon>,
        dataPath: `${process.env.PUBLIC_URL}/data/firestation.geojson`,
      },
      {
        type: "maplayer",
        name: "Care Facilities",
        key: "CareFacilities",
        icon: <Icon fontSize="small">Care Facilities</Icon>,
        dataPath: `${process.env.PUBLIC_URL}/data/carefacilities.geojson`,
      },
      {
        type: "maplayer",
        name: "Communication Facilities",
        key: "Communication",
        icon: <Icon fontSize="small">Communication Facilities</Icon>,
        dataPath: `${process.env.PUBLIC_URL}/data/communicationfacilities.geojson`,
      },
    ],
  },
  {
    type: "divider",
    key: "divide4",
    name: "divide4",
  },
  {
    type: "collapse",
    name: "Data Analytics",
    key: "C_DataAnalytics",
    icon: <Icon fontSize="small">Data Analytics</Icon>,
    collapse: [
      {
        type: "maplayer",
        name: "Traffic Flow",
        key: "Simulation_Car",
        icon: <Icon fontSize="small">Traffic</Icon>,
      },
      {
        type: "maplayer",
        name: "Train Route",
        key: "Simulation_Train",
        icon: <Icon fontSize="small">Train</Icon>,
      },
      {
        type: "maplayer",
        name: "Bus Route",
        key: "Simulation_Bus",
        icon: <Icon fontSize="small">Bus</Icon>,
      },
      {
        type: "maplayer",
        name: "Road Closures",
        key: "TransEvents",
        icon: <Icon fontSize="small">Events</Icon>,
        dataPath:
          "https://services.arcgis.com/8lRhdTsQyJpO52F1/arcgis/rest/services/CARS511_Iowa_View/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson",
      },
    ],
  },
  {
    type: "divider",
    key: "divide5",
    name: "divide5",
  },
];

export default layers;

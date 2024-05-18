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

// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React examples
import NewLayout from "examples/LayoutContainers/NewLayout";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import SC3DBuilding from "components/SC3DBuilding";
// Custom styles for the Sidenav
import SidenavRoot from "examples/Sidenav/SidenavRoot";
import sidenavLogoLabel from "examples/Sidenav/styles/sidenav";


function Map3D() {
  return (
    <DashboardLayout>
      {/* CANDO: Haritanın üstünde değişiklik yapacaksan buraya yazacaksın */}
      <MDBox mt={9}>
        <MDBox mb={3}>
          <SC3DBuilding />
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}
export default Map3D;

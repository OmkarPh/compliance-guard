import {
  Card,
  CardBody,
  CardHeader,
  IconButton,
  Input,
  Menu,
  MenuHandler,
  MenuItem,
  MenuList,
  Typography,
} from "@material-tailwind/react";
import {
  ClipboardDocumentCheckIcon,
  EllipsisVerticalIcon,
  HomeModernIcon,
  ListBulletIcon,
} from "@heroicons/react/24/solid";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional theme CSS
import "ag-grid-community/styles/ag-theme-material.css"; // Optional theme CSS
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
  AgEvent,
  CellClickedEvent,
  ColDef,
  GridReadyEvent,
} from "ag-grid-community";
import axios from "axios";

function parseDate(dateString: string) {
  if (!dateString) {
    return "-"; // Return null or any default value if the date is empty
  }
  const [day, month, year] = dateString.split("/");
  const formattedDate = `${year}/${month}/${day}`;
  return formattedDate;
}


export function Compliant() {
  const navigate = useNavigate();
  const gridRef = useRef<any>();
  const [searchQuery, setSearchQuery] = useState("");
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([
    { headerName: "Timestamp", field: "timestamp", wrapText: false },
    { headerName: "Log Level", field: "loglevel", width: 120 },
    { headerName: "Service", field: "service", width: 120 },
    { headerName: "Module", field: "module", width: 120 },
    { headerName: "User ID", field: "userid", width: 130 },
    { headerName: 'Module', field: 'module' , width: 130},
    { headerName: 'User ID', field: 'userid', width: 130 },
    { headerName: 'Event', field: 'event', width: 450 },
    // { headerName: "Event", field: "event" },
  ]);
  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      resizable: true,
      wrapText: true,
      autoHeight: true,
    }),
    []
  );

  // Cell click event
  const cellClickedListener = useCallback((event: CellClickedEvent) => {
    // navigate(`/dashboard/society/${event.data["SrNo"]}`);
    console.log("cellClicked", event.data);
  }, []);
  const onGridReady = (e: GridReadyEvent) => {
    const { api, columnApi } = gridRef.current;
    // if (window.innerWidth > 500) {
      e.api.sizeColumnsToFit();
    // }
    e.columnApi.resetColumnState();
  };

  // Searching handler
  const handleSearch = () => {
  };

  const [compliantLogs, setCompliantLogs] = useState([]);

  useEffect(() => {
    // Fetch compliant logs
    axios
      .get("http://127.0.0.1:5000/api/compliantlogs")
      .then((response) => {
        setCompliantLogs(response.data);
      })
      .catch((error) => {
        console.error("Error fetching compliant logs:", error);
      });
  }, []);

  return (
    <div className="z-0 mt-6">
      <div className="mb-4 grid grid-cols-1">
        <Card className="overflow-hidden">
          <CardHeader
            floated={false}
            shadow={true}
            color="transparent"
            className="m-0 flex flex-wrap items-center justify-between p-6"
          >
            <div className="relative order-1 flex w-max align-baseline">
              <ClipboardDocumentCheckIcon
                width={window.innerWidth < 500 ? 35 : 40}
                height={window.innerWidth < 500 ? 35 : 40}
                className="inline"
              />
              <Typography
                variant="h4"
                color="blue-gray"
                className="w-100 ml-3 mt-2 text-lg sm:text-xl md:text-2xl"
              >
                Compliant logs
              </Typography>
              <Typography
                variant="h6"
                color="blue-gray"
                className="absolute top-8 ml-3 mt-2 text-sm font-light"
                style={{ fontSize: "11px" }}
              >
                Click on the log
              </Typography>
            </div>
            <div className="order-3 ml-auto mr-3 mt-5 flex w-full shrink-0 gap-2 md:order-2 md:mt-0 md:w-max">
              <div className="w-full md:w-72">
                <Input
                  onChange={(e) => setSearchQuery(e.target.value)}
                  label="Search ...."
                  icon={
                    <MagnifyingGlassIcon
                      onClick={handleSearch}
                      className="h-5 w-5 cursor-pointer"
                    />
                  }
                  crossOrigin={undefined}
                />
              </div>
            </div>
            <div className="order-2 md:order-3">
              <Menu placement="left-start">
                <MenuHandler>
                  <IconButton size="sm" variant="text" color="blue-gray">
                    <EllipsisVerticalIcon
                      strokeWidth={3}
                      fill="currenColor"
                      className="h-6 w-6"
                    />
                  </IconButton>
                </MenuHandler>
                <MenuList>
                  <MenuItem>Export to CSV</MenuItem>
                  <MenuItem>Export to PDF</MenuItem>
                </MenuList>
              </Menu>
            </div>
          </CardHeader>
          <CardBody className="ag-theme-material w-100 h-[73vh] overflow-x-auto px-0 pt-0 pb-2">
            <AgGridReact
              pagination={true}
              paginationPageSize={20}
              onGridReady={onGridReady}
              ref={gridRef} // Ref for accessing Grid's API
              rowData={compliantLogs} // Row Data for Rows
              columnDefs={columnDefs} // Column Defs for Columns
              defaultColDef={defaultColDef} // Default Column Properties
              onCellClicked={cellClickedListener} // Optional - registering for Grid Event
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default Compliant;

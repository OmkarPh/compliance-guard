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
import { ClipboardDocumentCheckIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
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

const data: any[] = [];
export function NonCompliant() {
  const parsedResults = data.map((item) => ({
    ...item,
    "Date of Registration": parseDate(item["Date of Registration"]),
  }));
  const navigate = useNavigate();
  const gridRef = useRef<any>();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState(parsedResults);
  const [rowData, setRowData] = useState(parsedResults);
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([
    { headerName: "Timestamp", field: "timestamp", wrapText: false },
    { headerName: "Log Level", field: "loglevel", width: 110 },
    { headerName: "Service", field: "service", width: 150 },
    { headerName: "Module", field: "module", width: 150 },
    { headerName: "User ID", field: "userid", width: 120 },
    { headerName: "Event", field: "event", width: 350 },
    { headerName: "Cause", field: "cause", width: 350 },
    { headerName: "Breaches", field: "breaches", width: 350 },
    { headerName: "Insight", field: "insight", width: 350 },
    { headerName: "Teams", field: "teams", width: 350 },
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
    if (window.innerWidth > 500) {
      e.api.sizeColumnsToFit();
    }
    e.columnApi.resetColumnState();
    setRowData(filteredResults);
  };

  // Searching handler
  const handleSearch = () => {
    const searchResults = data.filter((item) =>
      item["Name of Society"].toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredResults(searchResults);
    setRowData(searchResults);
    if (searchResults.length === 0) {
      // Handle the case when no results are found
      // For example, you can display a message or perform any desired action
      console.log("No results found.");
    }
  };

  const [nonCompliantLogs, setNonCompliantLogs] = useState([]);

  useEffect(() => {
    // Fetch non-compliant logs
    axios
      .get("http://127.0.0.1:5000/api/noncompliantlogs")
      .then((response) => {
        console.log(response.data);
        setNonCompliantLogs(response.data);
      })
      .catch((error) => {
        console.error("Error fetching non-compliant logs:", error);
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
              <ListBulletIcon
                width={window.innerWidth < 500 ? 35 : 40}
                height={window.innerWidth < 500 ? 35 : 40}
                className="inline"
              />
              <Typography
                variant="h4"
                color="blue-gray"
                className="w-100 ml-3 mt-2 text-lg sm:text-xl md:text-2xl"
              >
                Non compliant logs
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
              rowData={nonCompliantLogs} // Row Data for Rows
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

export default NonCompliant;

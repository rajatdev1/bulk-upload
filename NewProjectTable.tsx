'use client';
import React, { useState, useEffect } from 'react';
import UploadButton from '../../../components/UploadButton/UploadButton';
import {
  Box,
  Grid,
  IconButton,
  Link,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { RiDownloadLine } from 'react-icons/ri';
import { FaFileExport } from 'react-icons/fa';
import CustomButton from '../../../components/CustomButton/CustomButton';
import Tooltip from '@mui/material/Tooltip';
import MainLayout from '../MainLayout';
import TableComp2 from './BulkProjectTable';
import '../../styles/style.css';
import '../../styles/fonts.css';
import { useRouter } from 'next/navigation';
import { ApiService } from '../../../hive/services/api.service';
import * as XLSX from 'xlsx';
import { ListProps } from '../outlet';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

type NewProjectTableProps = {
  selectedProjectType: string;
  selectedProjectId: any;
  selectedProject: any;
  showTable: boolean;
  selectedProjectTypeName: any;
};

const NewProjectTable: React.FC<NewProjectTableProps> = ({
  selectedProjectType,
  selectedProjectId,
  selectedProject,
  showTable,
}) => {
  const [value, setValue] = useState<number>(0);
  const router = useRouter();
  const apiservice = new ApiService();
  const [column, setColumn] = useState<ListProps[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [data1, setData1] = useState<any[]>([]);
  const [editingRowData, setEditingRowData] = useState({});
  const [searchInput, setSearchInput] = useState('');
  const [sort, setSort] = useState({ field: '', order: '' });
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const label = { inputProps: { 'aria-label': 'Switch demo' } };
  const [editingRowId, setEditingRowId] = useState(null);
  console.log('selectedProjectId 35', selectedProjectId);
  const [originalData, setOriginalData] = useState([]);

  // console.log("existing project 40",selectedProject)
  console.log('45 selectedProjectType', selectedProjectType);

  const [showInvalid, setShowInvalid] = useState(false);

  const apiService = new ApiService();

  const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowInvalid(event.target.checked);
  };

  useEffect(() => {
    setData1(data);
  }, []);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files && event.target.files[0];

    if (
      !file ||
      (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls'))
    ) {
      alert('Please select a valid Excel file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e: ProgressEvent<FileReader>) => {
      if (e.target?.result instanceof ArrayBuffer) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData: any[] = XLSX.utils.sheet_to_json(firstSheet, {
          header: 1,
        });

        console.log('jsonData',jsonData)

        const headers = jsonData[0]
          .filter((header: any) => !['Id', 'IsValid'].includes(header))
          .map((header: any) => ({
            id: header,
            name: header,
            isSort: true,
            isFilter: true,
            isFrozen: false,
            isPinned: false,
            isVisible: true,
          }));

        // Optionally, add 'actions' header if needed
        headers.push({
          id: 'actions',
          name: 'Actions',
          isSort: false,
          isFilter: false,
          isFrozen: false,
          isPinned: false,
          isVisible: true,
        });

        console.log('117 headers', headers);
        // Extract data
        const extractedData = jsonData.slice(1).map((row) => {
          return headers.reduce((object: any, header: any, index: any) => {
            object[header.id] = row[index];
            return object;
          }, {});
        });
        console.log('125 extractedData', extractedData);
        setColumn(headers);

        setData(extractedData);
        const formData = new FormData();
        formData.append('file', file);

        try {
          const uploadUrl = isFileUploaded
            ? `http://4.224.102.99/hiveconnect/requestmanagement/requestOutlet/upload/${selectedProject.id}?isReUpload=true`
            : `http://4.224.102.99/hiveconnect/requestmanagement/requestOutlet/upload/${selectedProject.id}`;
          const response = await apiservice.postData(uploadUrl, formData);
          console.log('Upload response:', response);
          // Update your state or handle the response as needed
          alert('File uploaded successfully');
          setIsFileUploaded(true);
        } catch (error) {
          alert('Failed to upload file');
          console.error('Error sending data to the server:', error);
        }
      }
    };

    reader.readAsArrayBuffer(file);
  };
  const getExistingProject = async () => {
    try {
      const response = await apiservice.fetchData(
        `http://4.224.102.99/hiveconnect/requestmanagement/requestOutlet/${selectedProject.id}/true?valid=true`
      );
      console.log('89 SHOW', response);
      if (response && response.data && response.data.list) {
        let filteredData = response.data.list;
        if (showInvalid) {
          filteredData = filteredData.filter(
            (item: { isValid: any }) => !item.isValid
          );
          console.log('209 filteredData', filteredData);
        }
        console.log('showInvalid', showInvalid);
        const headers =
          filteredData.length > 0
            ? [
                ...Object.keys(filteredData[0])
                  .filter(
                    (key) =>
                      ![
                        'id',
                        'isValid',
                        'productGroupId',
                        'projectType',
                      ].includes(key)
                  )
                  .map((key) => ({
                    id: key,
                    name: key.charAt(0).toUpperCase() + key.slice(1),
                    isSort: true,
                    isFilter: true,
                    isFrozen: false,
                    isPinned: false,
                    isVisible: true,
                  })),
                {
                  id: 'actions',
                  name: 'Actions',
                  isSort: false,
                  isFilter: false,
                  isFrozen: false,
                  isPinned: false,
                  isVisible: true,
                },
              ]
            : [];

            console.log('206 headers',headers)
   

        setColumn(headers);

        console.log('226 filteredData', filteredData);
        setData(filteredData);
      }

      // console.log('employee response 102', response);

      // if (newData) {
      //   setData(newData);
      // }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (selectedProject) {
      getExistingProject();
    }
  }, [selectedProject, showInvalid]);

  const downloadfile = async () => {
    try {
      const response = await apiservice.fetchProjectTypeName(
        `http://4.224.102.99/hiveconnect/requestmanagement/projecttype/${selectedProject.type}`
      );

      console.log('response 75', response.data);

      const jsonData = JSON.stringify(response.data, null, 2);
      console.log('83', jsonData);

      if (
        response.statusCode === 200 &&
        response.data &&
        response.data.fileUrl
      ) {
        const fileUrl = response.data.fileUrl;

        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = response.data.name || 'download.xlsx';
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
      } else {
        console.error('File URL not found in the response');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const Exportdata = async () => {
    try {
      const apiUrl = `http://4.224.102.99/hiveconnect/requestmanagement/projectrequest/projectid/${selectedProject.id}`;

      const payload = { tableData: data };
      console.log('payload', payload);

      const response = await apiservice.fetchData(apiUrl, payload);
      console.log('361', response);

      if (response && response.data && response.data.validatedUrl) {
        const fileUrl = response.data.validatedUrl;
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = 'DownloadedData.xlsx';
        document.body.appendChild(link);

        link.click();
        document.body.removeChild(link);
      } else {
        console.error('Excel file URL not available in the API response');
        alert('Failed to download Excel file. URL not available.');
      }
    } catch (error) {
      console.error('Error downloading Excel file:', error);
      alert('Failed to download Excel file. Please try again.');
    }
  };

  const handlePatchBulk = async (index: number, patchData: any) => {
    const id = data[index].id; // Get the ID from data using index
    const endpoint = `http://4.224.102.99/hiveconnect/requestmanagement/requestOutlet/${id}`;

    try {
      const response = await apiservice.patchDataBulk(endpoint, patchData);
      if (response.statusCode === 200) {
        setData((prevData) =>
          prevData.map((item, idx) =>
            idx === index ? { ...item, ...editingRowData } : item
          )
        );
        console.log('Success:', response.message);
      } else {
        console.error('Error:', response.message);
      }
    } catch (error) {
      console.error('API call failed:', error);
    }
  };

  const handleProceedClick = async () => {

    const confirmed = window.confirm('Would you like to proceed with validated rows?');

    if (confirmed) {
      try {
        const url = `http://4.224.102.99/hiveconnect/requestmanagement/requestOutlet/migrate/${selectedProject.id}`;
        const response = await apiservice.postDataBulkuploadProceed(url);
        console.log('API Response:', response);
      } catch (error) {
        console.error('API Error:', error);
      
      }
    }
  };

  const handleDelete = async (id: any) => {
    const url = `http://4.224.102.99/hiveconnect/requestmanagement/requestOutlet/${id}`;

    const payload = [
      {
        op: 'replace',
        path: '/isDeleted',
        value: 'true',
      },
    ];

    try {
      const response = await apiservice.patchDataBulk(url, payload);
      console.log('Delete response:', response);

      if (response && response.data === true) {
        setData((currentData) => currentData.filter((item) => item.id !== id));
      } else {
        console.error('Deletion was not successful', response);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  return (
    <>
      <MainLayout>
        <Box component="div" className="main-box">
          <Grid
            container
            spacing={3}
            sx={{
              marginTop: '15px',
              display: 'flex',
              justifyContent: 'end',
              alignItems: 'center',
            }}
          >
            {((selectedProjectType === 'New' && isFileUploaded) ||
              selectedProjectType === 'Existing') && (
              <FormControlLabel
                control={
                  <Switch
                    {...label}
                    checked={showInvalid}
                    onChange={handleToggleChange}
                  />
                }
                label="Show Invalid Data"
              />
            )}

            {selectedProjectType === 'New' && (
              <UploadButton
                onFileSelect={handleFileSelect}
                accept="*/*"
                label={isFileUploaded ? 'Re-upload' : 'Upload'}
                buttonStyle={{ padding: '10px 30px' }}
              />
            )}

            {selectedProjectType === 'Existing' && (
              <UploadButton
                onFileSelect={handleFileSelect}
                accept="*/*"
                label="Re-Upload"
                buttonStyle={{ padding: '10px 30px' }}
              />
            )}
            {selectedProjectType === 'New' && (
              <Tooltip title="Download Template" placement="top">
                <CustomButton
                  onClick={downloadfile}
                  type="button"
                  style={{
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '11px 10px',
                    margin: '0px 10px',
                    minWidth: '45px',
                  }}
                  className="upload_icon"
                >
                  <RiDownloadLine
                    style={{ color: 'black', fontSize: '22px' }}
                  />
                </CustomButton>
              </Tooltip>
            )}
            <IconButton
              onClick={Exportdata}
              style={{
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '11px 10px',
                margin: '0px 10px',
              }}
            >
              <FaFileExport style={{ fontSize: '20px' }} />
            </IconButton>
          </Grid>
          <Typography style={{ color: 'red', textAlign: 'end' }}>
            Kindly ensure to upload with the latest template
          </Typography>
          <Box className="white-box">
            {selectedProjectType === 'New' && isFileUploaded && (
              <TableComp2
                showDeleteIcon={selectedProjectType === 'New'}
                enableInlineEditing={true}
                isBulkEditing={true}
                data={data}
                column2={column}
                setColumn2={setColumn}
                setSearchInput={setSearchInput}
                setSort={setSort}
                sort={sort}
                setFilters={setFilters}
                filters={filters}
                page={page}
                setPage={setPage}
                rowsPerPage={rowsPerPage}
                setRowsPerPage={setRowsPerPage}
                searchInput={searchInput}
                handlePatch={handlePatchBulk}
                handleDelete={handleDelete}
                editingRowData={editingRowData}
                setEditingRowData={setEditingRowData}
              />
            )}
            {selectedProjectType === 'Existing' && (
              <TableComp2
                showDeleteIcon={selectedProjectType === 'Existing'}
                enableInlineEditing={true}
                isBulkEditing={true}
                data={data}
                column2={column}
                setColumn2={setColumn}
                setSearchInput={setSearchInput}
                setSort={setSort}
                sort={sort}
                setFilters={setFilters}
                filters={filters}
                page={page}
                setPage={setPage}
                rowsPerPage={rowsPerPage}
                setRowsPerPage={setRowsPerPage}
                searchInput={searchInput}
                handlePatch={handlePatchBulk}
                handleDelete={handleDelete}
                editingRowData={editingRowData}
                setEditingRowData={setEditingRowData}
              />
            )}
          </Box>
        </Box>
      </MainLayout>
      <Grid
       style={{
        display:'flex' ,
        justifyContent:'flex-end'        
          }}
      >
      <CustomButton
        type="button"
        className="btn btn-black"
        onClick={handleProceedClick}
        // disabled={!isUploadAndReviewClickable}
      >
        Proceed
      </CustomButton>
      </Grid>
    </>
  );
};

export default NewProjectTable;

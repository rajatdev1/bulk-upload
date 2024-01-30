'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '../MainLayout';
import { Box, Tab, Tabs, Typography, Grid, Button } from '@mui/material';
import Link from 'next/link';
import '../../styles/style.css';
import '../../styles/fonts.css';
import NewSelectOption from '../../../components/NewSelectbox/NewSelectoption';
import NewTextField from '../../../components/NewTextField/NewTextField';
import CustomButton from '../../../components/CustomButton/CustomButton';
import ReusableRadioButton from '../../../components/RadioButtonComp/ReusableRadioButton';
import NewProjectTable from '../../pages/BulkUpload/NewProjectTable';
import { useRouter } from 'next/navigation';
import { ApiService } from '../../services/api.service';
import { Snackbar } from '@mui/material';

interface Project {
  name: string;
  id: string;
}

interface ProjectType {
  id: string;
}

interface Project {
  projectType: ProjectType;
  selectedProjectId: any;
}

interface SelectedProject {
  id: string | null;
  type: string;
}

const Bulkuploadform = () => {
  const [value, setValue] = useState(0);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [selectedProjectType, setSelectedProjectType] = useState('New');
  const [projectNameError, setProjectNameError] = useState('');

  // Rest of your component
  
  const [isUploadAndReviewClickable, setIsUploadAndReviewClickable] =
    useState(false);
  const [projectType, setProjectType] = useState<Project[]>([]);
  const [prName, setPrName] = useState<Project[]>([]);
  const [filteredPrNames, setFilteredPrNames] = useState<Project[]>([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const apiservice = new ApiService();
  const router = useRouter();
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<SelectedProject>({
    id: null,
    type: 'New',
  });

  // const [selectedProject, setSelectedProject] = useState<string>('')

  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [showTable, setShowTable] = useState(false);

  const [formData, setFormData] = useState({
    projectType: '',
    projectName: '',
    prName: '',
  });



  const alphanumericRegex = /^[a-zA-Z0-9]+$/;

  const handleFieldChangebyprojectname = (event:any) => {
    const { name, value } = event.target;
  
    if (name === 'projectName') {
      if (value === '' || alphanumericRegex.test(value)) {
        // Update your state for a valid input or empty string
        setFormData({...formData, [name]: value});
        setProjectNameError('')
      } else {
        setProjectNameError('Only alphanumeric characters are allowed');
      }
    } else {
      // Handle changes for other fields
      // ...
    }
  };

  const isFormValid = () => {
    if (selectedProjectType === 'New') {
      return Boolean(formData.projectType && formData.projectName);
    } else if (selectedProjectType === 'Existing') {
      return Boolean(formData.projectType && formData.prName);
    }
    return false;
  };

  const handleFieldChangeProjectType = (e: any) => {
    const selectedTypeId = e.target.value;
    setFormData({ ...formData, projectType: selectedTypeId });

    // Filter project names based on the selected project type
    const relatedPrNames = prName.filter(
      (project) => project.projectType.id === selectedTypeId
    );
    setFilteredPrNames(relatedPrNames);
  };

  const handleCloseSnackbar = (event: any, reason: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  useEffect(() => {
    const fetchProjectType = async () => {
      try {
        const apiservice = new ApiService();
        const response = await apiservice.fetchProjectTypeName(
          'http://4.224.102.99/hiveconnect/requestmanagement/projecttype'
        );

        setProjectType(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const fetchProjectName = async () => {
      try {
        const apiservice = new ApiService();
        const response = await apiservice.fetchProjectTypeName(
          'http://4.224.102.99/hiveconnect/requestmanagement/project'
        );

        setPrName(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchProjectType();
    fetchProjectName();
  }, []);

  useEffect(() => {
    return setIsUploadAndReviewClickable(isFormValid());
  }, [formData]);

  console.log('134 createdProjectId', createdProjectId);

  const handleNextClick = async () => {
    if (selectedProjectType === 'New') {
      const data = {
        name: formData.projectName,
        projectTypeId: formData.projectType,
      };

      try {
        const response = await apiservice.postProjectName(
          'http://4.224.102.99/hiveconnect/requestmanagement/project',
          data
        );

        if (response.statusCode === 200) {
          // Assuming the API returns the ID of the created project
          setCreatedProjectId(response.data.id);

          setSelectedProject({
            id: response.data.id,
            type: formData.projectType,
          });
          setSuccessMessage('Project created successfully');
          setOpenSuccessSnackbar(true);
          setValue(1);
        } else if (
          response.statusCode === 400 &&
          response.message === 'Failure'
        ) {
          const failureReason = response.data.failure.details
            .map((detail: { reason: any }) => detail.reason)
            .join(', ');
          setSnackbarMessage(`Error: ${failureReason}`);
          setOpenSnackbar(true);
        } else {
          // Handle other errors
          setSnackbarMessage(
            'Error: Project creation failed due to an unknown error.'
          );
          setOpenSnackbar(true);
        }
      } catch (error) {
        const errorMessage = (error as Error).message;
        setSnackbarMessage(`Error: ${errorMessage}`);
        setOpenSnackbar(true);
      }
    } else if (selectedProjectType === 'Existing') {
      // if (formData.prName) {
      //   setSelectedProject(formData.prName);
      // }
      if (formData.prName) {
        setSelectedProject({
          id: formData.prName,
          type: formData.projectType,
        });
      }

      setIsUploadAndReviewClickable(true);
      setValue(1); // Navigate to the next tab
      setShowTable(true);
    }
  };

  const handleFieldChange = (event: any) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (name === 'prName') {
      // Assuming value is the project ID for existing projects
      setCreatedProjectId(value);
    }
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    if (newValue === 1 && !isUploadAndReviewClickable) {
      return;
    }
    setValue(newValue);
  };

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedProjectType(event.target.value);
  };

  const handleProceedClick = () => {
    console.log('h');
  };

  return (
    <MainLayout>
      <>
        <Box className="white-box">
          <Typography
            component="p"
            className="m-0 text-dark breadcrumb-text"
          >
            <Link href="/dashboard" style={{ textDecoration: 'none' }}>
              {' '}
              Home
            </Link>{' '}
            / Request / Bulk
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: '10px 0',
            }}
          >
            <Typography
              component="h3"
              variant="h3"
              className="h3 page-heading-text"
            >
              Bulk Request Creation
            </Typography>
          </Box>
        </Box>

        <Box component="div" className="main-box">
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
            className='dashtab-parent'
          >
            <Tab
              label="Projects Details"
              className="tabs_btn dashtabs"
            />
            <Tab
              label="Upload & Review"
              disabled={!isUploadAndReviewClickable}
              className="tabs_btn dashtabs"
            />
          </Tabs>

          {value === 0 && (
            <>
              <Box sx={{display: 'flex', flexWrap: 'wrap', mt: '10px'}}>
                  <ReusableRadioButton
                    onChange={handleRadioChange}
                    value="New"
                    checked={selectedProjectType === 'New'}
                    name="New Project"
                  />

                  <ReusableRadioButton
                    onChange={handleRadioChange}
                    value="Existing"
                    checked={selectedProjectType === 'Existing'}
                    name="Existing Project"
                  />
              </Box>

              <Grid
                container
                rowSpacing={{ xs: 3, sm: 3, md: '25px' }}
                columnSpacing={{ xs: 2, sm: 3, md: '54px' }}
                sx={{ marginTop: '10px !important', paddingBottom: '50px' }}
              >
                <Grid item xl={3} lg={4} md={6} sm={12} xs={12}>
                  <NewSelectOption
                    label={
                      <>
                        Project Type
                        <span style={{ color: 'red' }}>*</span>
                      </>
                    }
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleFieldChangeProjectType}
                    options={projectType.map((type) => ({
                      value: type.id,
                      label: type.name,
                    }))}
                    placeholder="Select a Project Type"
                    style={{ color: 'blue' }}
                    className="my-custom-select"
                    onFocus={() => setFocusedField('projectType')}
                    onBlur={() => setFocusedField(null)}
                    error={
                      focusedField === 'projectType' && !formData.projectType
                    }
                    helperText={
                      focusedField === 'projectType' && !formData.projectType
                        ? 'Project Type is required'
                        : ''
                    }
                    sx={{ maxWidth: '100%', background: 'white' }}
                  />
                </Grid>

                {selectedProjectType === 'New' ? (
                  <Grid item xl={3} lg={4} md={6} sm={12} xs={12}>
                    <NewTextField
                       
                       name="projectName"
                       label="Project Name"
                       placeholder="Enter Project Name"
                       value={formData.projectName}
                       onChange={handleFieldChangebyprojectname}
                       required={true}
                       onFocus={() => setFocusedField('projectName')}
                       onBlur={() => setFocusedField(null)}
                       error={
                         focusedField === 'projectName' && 
                         (!formData.projectName || projectNameError)
                       }
                       helperText={
                         focusedField === 'projectName' && !formData.projectName
                           ? 'Project name is required'
                           : projectNameError
                       }
                       type={undefined}
                    
                    />
                  </Grid>
                ) : (
                  <Grid item xl={3} lg={4} md={6} sm={12} xs={12}>
                    <NewSelectOption
                      label={
                        <>
                          Project Name
                          <span style={{ color: 'red' }}>*</span>
                        </>
                      }
                      name="prName"
                      value={formData.prName}
                      onChange={(e) =>
                        setFormData({ ...formData, prName: e.target.value })
                      }
                      options={filteredPrNames.map((project) => ({
                        label: project.name,
                        value: project.id,
                      }))}
                      placeholder="Select Project Name"
                      style={{ color: 'blue' }}
                      className="my-custom-select"
                      onFocus={() => setFocusedField('prName')}
                      onBlur={() => setFocusedField(null)}
                      error={focusedField === 'prName' && !formData.prName}
                      helperText={
                        focusedField === 'prName' && !formData.prName
                          ? 'Project Type is required'
                          : ''
                      }
                      sx={{ maxWidth: '100%', background: 'white' }}
                    />
                  </Grid>
                )}
              </Grid>
            </>
          )}

          {value === 1 && (
            <NewProjectTable
              //  selectedProjectType={formData.projectType}
              selectedProjectType={selectedProjectType}
              selectedProjectId={createdProjectId}
              selectedProject={selectedProject}
              showTable={showTable}
              selectedProjectTypeName={undefined}
            />
          )}
        </Box>

        <Grid
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '20px',
          }}
        >
          {/* {value === 1 && (
            <CustomButton
              type="button"
              className="btn btn-black"
              onClick={handleProceedClick}
              disabled={!isUploadAndReviewClickable}
            >
              Proceed
            </CustomButton>
          )} */}

          {value === 0 && (
            <CustomButton
              type="button"
              className="btn btn-black"
              onClick={handleNextClick}
              disabled={!isUploadAndReviewClickable}
            >
              Next
            </CustomButton>
          )}
        </Grid>

        <Snackbar
          open={openSnackbar || openSuccessSnackbar}
          autoHideDuration={6000}
          onClose={
            openSnackbar
              ? handleCloseSnackbar
              : () => setOpenSuccessSnackbar(false)
          }
          message={
            <span style={{ color: openSnackbar ? 'red' : 'white' }}>
              {openSnackbar ? snackbarMessage : successMessage}
            </span>
          }
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          ContentProps={{
            style: {
              backgroundColor: openSnackbar ? 'white' : 'green', // White for error, green for success
              color: openSnackbar ? 'red' : 'white', // Red for error, white for success
            },
          }}
        />
      </>
    </MainLayout>
  );
};

export default Bulkuploadform;

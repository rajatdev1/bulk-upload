'use client';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import React, { useEffect, useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  MenuItem,
  Stack,
  Autocomplete,
  Popover,
  Box,
} from '@mui/material';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';


import Pagination from '../../../components/Pagination/Pagination';
import { BiSort } from 'react-icons/bi';

import KeepMountedModal from '../../../components/CustomModal/CustomModal';
import '../../styles/appbar.scss';
import '../../styles/global.css';
import '../../styles/style.css';

import CustomButton from '../../../components/CustomButton/CustomButton';
import ListComp from '../ListComp';

import { BiSortDown, BiSortUp } from 'react-icons/bi';
import { BsFunnel } from 'react-icons/bs';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd';
// import { FaSnowflake, FaSun } from 'react-icons/fa';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
// import 'react-resizable/css/styles.css';
import FilterPopover from '../../../components/Popupfilter/FilterPopover';
import { getDictionary } from '../../../getDictionary';
import { useParams } from '../../../app/[lang]/ParamContext';
import { ListProps } from '../outlet';
import BasicTextFields from '../SearchBox';

interface DataItem {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  designation: string;
  pincode: string;
  startDate: string;
  [key: string]: any;
}
interface EditableRowData {
  [key: string]: any; // Replace with your specific row data types
}
export interface TableProps2 {
  data: any[];
  column2: any[];
  enableInlineEditing?: boolean;
  isBulkEditing?: boolean;
  setColumn2?: React.Dispatch<React.SetStateAction<ListProps[]>>;
  setSearchInput?: React.Dispatch<React.SetStateAction<string>>;
  setSort?: React.Dispatch<
    React.SetStateAction<{ field: string; order: string }>
  >;
  sort?: any;   
  filters?: object;
  setFilters?: React.Dispatch<React.SetStateAction<Record<any, any>>>;
  page?: number;
  setPage?: React.Dispatch<React.SetStateAction<number>>;
  rowsPerPage?: number;
  setRowsPerPage?: React.Dispatch<React.SetStateAction<number>>;
  deleteRow?: any;
  handlePatch?: (id: any, data: any) => Promise<void> | void;
  searchInput?: string;
  searchFunction?: any;
  Search?: (value: any) => void;
  showDeleteIcon: boolean;
  handleDelete?: (id: any) => void;
  // data1:any[]
  editingRowData?: any;
  setEditingRowData?: any;
}

function isNumeric(value: string | any) {
  return !isNaN(value) && !isNaN(parseFloat(value));
}

const TableComp2: React.FC<TableProps2> = ({
  data,
  column2,
  setColumn2,
  setSearchInput,
  setSort,
  sort,
  filters,
  setFilters,
  deleteRow,
  handlePatch,
  searchInput,
  searchFunction,
  showDeleteIcon,
  enableInlineEditing = false,
  isBulkEditing = false,
  handleDelete,
  editingRowData,
  setEditingRowData,
  
  // data1
}) => {
  const params = useParams();

  const [isLoading, setIsLoading] = useState(true);

  const [lang, setLang] = useState<any>(null);

  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedColumnValue, setSelectedColumnValue] = useState<string>('');
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [pinnedColumn, setPinnedColumn] = useState(null);
  const [ShowGlobalHeader, setShowGlobalHeader] = useState<boolean>(true);
  const [open, setOpen] = useState(false);
  const [frozenColumns, setFrozenColumns] = useState<string[]>([]);
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  
  const [editingData, setEditingData] = useState<any>({}); // Change 'any' to the
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingRowId, setDeletingRowId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<DataItem | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [patchData, setPatchData] = useState<string[]>([]);
  const [checked, setChecked] = useState<string[]>([]);
  const [page, setPage] = useState(0); // Start from the first page
  const [rowsPerPage, setRowsPerPage] = useState(10); //
  const indexOfFirstRow = page * rowsPerPage;
  const indexOfLastRow = indexOfFirstRow + rowsPerPage;

  // const currentRows = data.slice(indexOfFirstRow, indexOfLastRow);

  const currentRows = Array.isArray(data)
    ? data.slice(indexOfFirstRow, indexOfLastRow)
    : [];

  const [sortState, setSortState] = useState({ field: null, order: null });



  const startEditing = (index:any) => {
    console.log("Editing index:", index); // Log the index
    setEditingRowId(index);
    const currentRowData = data[index];
    console.log("Current row data being edited:", currentRowData);
    setEditingRowData(currentRowData);
    

  };
  

  // Cancel editing
  const cancelEditingBulk = () => {
    setEditingRowId(null);
    setEditingRowData({});
  };
  const handleInputChangeBulk: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: string
  ) => void = (e, field) => {
    console.log('edited', { ...editingRowData, [field]: e.target.value });
    setEditingRowData({ ...editingRowData, [field]: e.target.value });
  };

  const handleToggle = (value: string, index: any) => () => {
    console.log('toggle>>>', value, index);

    const updatedItems = [...column2];

    // Update the object at the specified index
    updatedItems[index] = { ...updatedItems[index], isVisible: !value };
    setColumn2 && setColumn2(updatedItems);
  };

  console.log('564', column2);

  const handleChangeRowsPerPage = (event: SelectChangeEvent<string>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const result = await getDictionary(params.lang);
      setLang(result);
      setIsLoading(false);
    };

    fetchData();
  }, [params.lang]);
  console.log(lang, 'lang');

  const handleSearch = (searchTerm: string) => {
    //golbal search

    setSearchInput && setSearchInput(searchTerm);
  };
  const applyFilter = () => {
    console.log('fildata', {
      ...filters,
      [selectedColumn]: selectedColumnValue,
    });
    setFilters &&
      setFilters({ ...filters, [selectedColumn]: selectedColumnValue });
    setFilterDialogOpen(false);
    setAnchorEl(null);
  };


  const handleSort = (columnId: string) => {
    const newData = [...data];
    const order =
      sort.field === columnId && sort.order === 'asc' ? 'desc' : 'asc';

    newData.sort((a, b) => {
      if (a[columnId] < b[columnId]) return order === 'asc' ? -1 : 1;
      if (a[columnId] > b[columnId]) return order === 'asc' ? 1 : -1;
      return 0;
    });

    setSort && setSort({ field: columnId, order });
    // setData(newData);
  };


 

  const handleColumnSort = (value: { id: string; isSort: boolean }) => {
    const updatedData = column2.map((item) => {
      if (item.id === value.id) {
        return {
          ...item,
          isSort: !value.isSort,
        };
      }
      return item;
    });
    setColumn2 && setColumn2(updatedData);
  };

  const handleColumnFilter = (value: { id: string; isFilter: unknown }) => {
    const updatedData = column2.map((item) => {
      if (item.id === value.id) {
        return {
          ...item,
          isFilter: !value.isFilter,
        };
      }
      console.log('item', item);
      return item;
    });
    setColumn2 && setColumn2(updatedData);
    console.log(column2);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(column2);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setColumn2 && setColumn2(items);
  };

 


  const cancelEditing = () => {
    setEditingRowId(null);
    setEditingData({});
  };





  const saveEditing = async (index:any) => {
    if (!editingRowData || Object.keys(editingRowData).length === 0) {
      console.error('No data to edit');
      return;
    }
  
  

    const patchPayload = Object.keys(editingRowData).map((key) => ({
      op: 'replace',
      path: `/${key}`,
      value: editingRowData[key],
    }));
  
    try {
      if (handlePatch) {
        await handlePatch(index, patchPayload); // Use index instead of id
      } else {
        console.error('handlePatch function is not provided.');
      }
    } catch (error) {
      console.error('Error while saving data:', error);
    }
  
    setEditingRowId(null);
    setEditingData({});
  };
  
  

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: string
  ) => {
    setEditingData({
      ...editingData,
      [id]: e.target.value,
    });

    const updatedFields = { ...editingData, [id]: e.target.value };
    const patchArr: any = [];

    for (const key in updatedFields) {
      if (updatedFields[key] !== editingData[key]) {
        // updatedFields[key] = editingData[key];
        patchArr.push({
          op: 'replace',
          path: `/${key}`,
          value: updatedFields[key],
        });
      }
    }
    console.log('editingData', updatedFields, editingData, e.target.value, id);
    setPatchData(patchArr);
  };

  const openFilterPopover = (
    event: React.MouseEvent<HTMLButtonElement>,
    columnId: string
  ) => {
    setSelectedColumn(columnId);
    setAnchorEl(event.currentTarget);
    console.log('458', event.currentTarget);
  };

  const closeFilterPopover = () => {
    setAnchorEl(null);
  };

  const getTranslation = (key: string, lang: any) => {
    const keys = key.split('.');
    let value = lang;

    for (const k of keys) {
      if (typeof value !== 'object' || value === null) return key; 
      value = value[k];
      if (!value) return key;
    }

    return value;
  };

  const clearAllFilters = () => {
    const clearedFilters: any = {};

    filters &&
      Object.keys(filters).forEach((key) => {
        clearedFilters[key] = null;
      });

    setFilters && setFilters(clearedFilters);
  };

  return (
    <>
      <Box component="div" className="main-box">
        <Box
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
          }}
        >
          {/* <SearchBox onSearch={handleSearch} /> */}
          <BasicTextFields
            onSearch={handleSearch}
            searchInput={searchInput}
            // searchFunction={() => searchFunction(searchInput)}
            searchFunction={searchFunction}
          />

          <Box>
            <CustomButton
              onClick={clearAllFilters}
              variant="outlined"
              className="button btn-clear"
            >
              <FilterAltOutlinedIcon /> Clear
            </CustomButton>
          </Box>
        </Box>

        {/* Grid Section */}

        <Box
          sx={{
            textAlign: 'center',
            overflowX: 'auto',
            marginTop: '10px',
            width: '100%',
          }}
        >
          <Paper>
            <TableContainer
              sx={{
                maxWidth: '100%',
                height: '100%',
              }}
              className="filter-table"
            >
              <Box className="table-responsive">
                <Table className="cust-table table">
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="columns" direction="horizontal">
                      {(provided) => (
                        <TableHead
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          <TableRow className="sticky-head">
                            <TableCell
                              align="left"
                              style={{
                                position: 'sticky',
                                left: 0,
                                zIndex: 1,
                              }}
                            >
                              S.No
                            </TableCell>

                            {column2?.map((column, index) =>
                              // visibleColumns.includes(column.id)
                              column.isVisible ? (
                                !frozenColumns.includes(column.id) &&
                                column.id !== 'id' &&
                                column.id !== 'actions' ? (
                                  <Draggable
                                    key={column.id}
                                    draggableId={column.id}
                                    index={index}
                                  >
                                    {(provided) => (
                                      <TableCell
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        ref={provided.innerRef}
                                        key={column.id}
                                        className={
                                          column.id === 'actions'
                                            ? 'actionsColumn'
                                            : column.id === 'id'
                                            ? 'idColumn'
                                            : ''
                                        }
                                        style={{
                                          ...provided.draggableProps.style,
                                          position:
                                            column.id === 'id' ||
                                            column.id === 'actions'
                                              ? 'sticky'
                                              : 'unset',
                                          top: 0,
                                          zIndex: 1,
                                        }}
                                        align="left"
                                      >
                                        <Box
                                          display="flex"
                                          justifyContent="space-between"
                                          alignItems="center"
                                        >
                                          {column.isSort &&
                                            column.id !== 'actions' && (
                                              <IconButton
                                                onClick={() =>
                                                  handleSort(column.id)
                                                }
                                              >
                                                {sort.field === column.id ? (
                                                  sort.order === 'asc' ? (
                                                    <BiSortUp />
                                                  ) : (
                                                    <BiSortDown />
                                                  )
                                                ) : (
                                                  <BiSort />
                                                )}
                                              </IconButton>
                                            )}

                                          {column.name}
                                          {column.isFilter &&
                                            column.id !== 'actions' && (
                                              <IconButton
                                                onClick={(e) =>
                                                  openFilterPopover(
                                                    e,
                                                    column.id
                                                  )
                                                }
                                              >
                                                <BsFunnel />
                                              </IconButton>
                                            )}
                                        </Box>
                                      </TableCell>
                                    )}
                                  </Draggable>
                                ) : (
                                  <TableCell
                                    key={column.id}
                                    sx={{
                                      position: 'sticky',
                                      zIndex: 1,
                                      left: column.id === 'id' ? 0 : 'auto',
                                      right:
                                        column.id === 'actions' ? 0 : 'auto',
                                      // backgroundColor: '#fff',
                                    }}
                                  >
                                    {(column.isSort || column.id === 'id') &&
                                      column.id !== 'actions' && (
                                        <IconButton
                                          onClick={() => handleSort(column.id)}
                                        >
                                          {sort.field === column.id ? (
                                            sort.order === 'asc' ? (
                                              <BiSortUp />
                                            ) : (
                                              <BiSortDown />
                                            )
                                          ) : (
                                            <BiSort />
                                          )}
                                        </IconButton>
                                      )}
                                    {column.name}

                                    {(column.isFilter || column.id === 'id') &&
                                      column.id !== 'actions' && (
                                        <IconButton
                                          onClick={(e) =>
                                            openFilterPopover(e, column.id)
                                          }
                                        >
                                          <BsFunnel />
                                        </IconButton>
                                      )}
                                  </TableCell>
                                )
                              ) : null
                            )}
                            {provided.placeholder}
                          </TableRow>
                        </TableHead>
                      )}
                    </Droppable>
                    <TableBody>
                      {currentRows.map((row, index) => (
                        <TableRow key={index}
                        // style={{ color: !row.isValid ? 'red' : '' }}
                        style={{color:row.isValid === false ? 'red' : 'inherit' }}
                        
                        >
                          {/* Serial Number Cell */}
                          <TableCell
                            style={{
                              position: 'sticky',
                              zIndex: 1,
                              left: 0,
                              backgroundColor: '#fff',
                            }}
                          >
                            {page * rowsPerPage + index + 1}
                          </TableCell>

                          {/* Data Cells */}
                          {column2?.map((column) =>
                            column.isVisible ? (
                              <TableCell
                                key={column.id}
                                align={
                                  isNumeric(row[column.id]) ? 'right' : 'left'
                                }
                                style={{
                                  position:
                                    column.id === 'id' ||
                                    column.id === 'actions'
                                      ? 'sticky'
                                      : 'unset',
                                  zIndex: 1,
                                  left: column.id === 'id' ? 0 : 'auto',
                                  right: column.id === 'actions' ? 0 : 'auto',
                                  color: row.isValid ? 'inherit' : 'red',

                                }}
                              >
                               {editingRowId === index && enableInlineEditing ? (
                                  column.id !== 'actions' ? (
                                    // Editable Input Field
                                    <TextField
                                      fullWidth
                                      value={editingRowData[column.id] || ''}
                                      onChange={(e) =>
                                        handleInputChangeBulk(e, column.id)
                                      }
                                      variant="outlined"
                                      size="small"
                                      style={{ margin: '8px' }}
                                    />
                                  ) : (
                                    // Save and Cancel Buttons for Editable Row
                                    <>
                                    <IconButton onClick={() => saveEditing(index)}>
                                      <SaveIcon />
                                    </IconButton>
                                    <IconButton onClick={() => cancelEditingBulk()}>
                                      <CancelIcon />
                                    </IconButton>
                                  </>
                                  )
                                ) : column.id === 'actions' ? (
                                  // Actions Column
                                  <>
                                     <IconButton
                                  className="edit-button"
                                 
                                   onClick={() => startEditing(index)}
                                  
                                        >
                                   <EditIcon />
                                    </IconButton>


                                    <IconButton
                                      className="view-button"
                                      onClick={() => {
                                        setSelectedUser(row);
                                        setViewModalOpen(true);
                                      }}
                                    >
                                      {/* <VisibilityIcon /> */}
                                    </IconButton>
                                    {showDeleteIcon && (
                                      <IconButton
                                        className="delete-button"
                                        onClick={() =>
                                          handleDelete && handleDelete(row.id)
                                        }
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    )}
                                  </>
                                ) : // Default Cell Content
                                lang ? (
                                  lang.form[row[column.id]] || row[column.id]
                                ) : (
                                  row[column.id]
                                )}
                              </TableCell>
                            ) : null
                          )}
                        </TableRow>
                      ))}
                    </TableBody>

                    <Dialog
                      className="user-modal"
                      open={viewModalOpen}
                      onClose={() => setViewModalOpen(false)}
                    >
                      <DialogTitle className="centered-title">
                        {lang ? lang.form.userinfo : 'Loading...'}
                      </DialogTitle>

                      <DialogContent>
                        {selectedUser ? (
                          <Box>
                            <p>
                              <strong>
                                {getTranslation('form.Id', lang) ||
                                  'Loading...'}
                                :
                              </strong>{' '}
                              {selectedUser.id}
                            </p>
                            <p>
                              <strong>
                                {getTranslation('form.Name', lang) ||
                                  'Loading...'}
                                :
                              </strong>{' '}
                              {getTranslation(
                                `form.${selectedUser.name}`,
                                lang
                              ) || selectedUser.name}
                            </p>
                            <p>
                              <strong>
                                {getTranslation('form.Email', lang) ||
                                  'Loading...'}
                                :
                              </strong>{' '}
                              {selectedUser.email}
                            </p>
                            <p>
                              <strong>
                                {getTranslation('form.Phone', lang) ||
                                  'Loading...'}
                                :
                              </strong>{' '}
                              {selectedUser.phone}
                            </p>
                            <p>
                              <strong>
                                {getTranslation('form.Address', lang) ||
                                  'Loading...'}
                                :
                              </strong>{' '}
                              {getTranslation(
                                `form.${selectedUser.address}`,
                                lang
                              ) || selectedUser.address}
                            </p>
                            <p>
                              <strong>
                                {getTranslation('form.Designation', lang) ||
                                  'Loading...'}
                                :
                              </strong>{' '}
                              {getTranslation(
                                `form.${selectedUser.designation}`,
                                lang
                              ) || selectedUser.designation}
                            </p>
                            <p>
                              <strong>
                                {getTranslation('form.pincode', lang) ||
                                  'Loading...'}
                                :
                              </strong>{' '}
                              {selectedUser.pincode}
                            </p>
                            {/* Add more fields as needed */}
                          </Box>
                        ) : null}
                      </DialogContent>
                      <DialogActions>
                        <Button
                          onClick={() => setViewModalOpen(false)}
                          color="primary"
                        >
                          {lang ? lang.form.close : 'Loading...'}
                        </Button>
                      </DialogActions>
                    </Dialog>

                    <Dialog
                      open={deleteDialogOpen}
                      onClose={() => setDeleteDialogOpen(false)}
                    >
                      <DialogTitle>
                        {' '}
                        {getTranslation('form.ConfirmDelete', lang)}
                      </DialogTitle>
                      <DialogContent>
                        <DialogContentText>
                          {lang ? lang.form.Delete : 'Loading...'}
                        </DialogContentText>
                      </DialogContent>
                      <DialogActions>
                        <Button
                          onClick={() => setDeleteDialogOpen(false)}
                          color="primary"
                        >
                          {lang ? lang.form.cancel : 'Loading...'}
                        </Button>
                        <Button
                          onClick={() => {
                            if (deletingRowId !== null) {
                              deleteRow(deletingRowId);
                              setDeleteDialogOpen(false);
                            }
                          }}
                          color="primary"
                        >
                          {lang ? lang.form.Yes : 'Loading...'}
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </DragDropContext>
                </Table>
              </Box>
              <Pagination
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                totalCount={data?.length}
              />
            </TableContainer>
          </Paper>

          <Dialog
            open={pinnedColumn !== null}
            onClose={() => setPinnedColumn(null)}
          >
            <DialogActions>
              <Button onClick={() => setPinnedColumn(null)}>
                {' '}
                {lang ? lang.form.cancel : 'Loading...'}
              </Button>
            </DialogActions>
          </Dialog>

          <FilterPopover
            anchorEl={anchorEl}
            onClose={() => setAnchorEl(null)}
            selectedColumn={selectedColumn}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            filters={filters}
            setFilters={setFilters}
            data={data}
            applyFilter={applyFilter}
            setSelectedColumnValue={setSelectedColumnValue}
            selectedColumnValue={selectedColumnValue}
          />
          <KeepMountedModal open={open} setOpen={setOpen}>
            <ListComp
              ListArr={column2}
              handleColumnSort={handleColumnSort}
              handleColumnFilter={handleColumnFilter}
              handleToggle={handleToggle}
              checked={checked}
              frozenColumns={frozenColumns}
            />
          </KeepMountedModal>
        </Box>
      </Box>
    </>
  );
};

export default TableComp2;





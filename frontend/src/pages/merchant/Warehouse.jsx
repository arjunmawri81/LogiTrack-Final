import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Checkbox,
  Autocomplete,
  TextField as MuiTextField,
  InputAdornment,
  TablePagination,
  Skeleton,
  Box as MuiBox,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Warehouse as WarehouseIcon,
} from '@mui/icons-material';
import api from '../../services/api';
import Sidebar from "../../components/Sidebar";
import "./Warehouse.css"; // ✅ Warehouse specific CSS

const Warehouse = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [filteredWarehouses, setFilteredWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [formData, setFormData] = useState({
    warehouseName: '',
    warehouseCode: '',
    companyName: '',
    contactPerson: '',
    phone: '',
    alternatePhone: '',
    email: '',
    gstNumber: '',
    panNumber: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    warehouseType: 'MAIN',
    dailyCapacity: '',
    pickupStartTime: '',
    pickupEndTime: '',
    workingDays: [],
    pickupInstructions: '',
    allowCOD: false,
    allowReversePickup: false,
    isDefault: false,
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    warehouseId: null,
    warehouseName: "",
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    filterWarehouses();
  }, [warehouses, searchQuery, filterStatus]);

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const response = await api.get('/warehouses');
      setWarehouses(response.data.warehouses || []);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      showSnackbar('Failed to fetch warehouses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterWarehouses = () => {
    let filtered = [...warehouses];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (w) =>
          w.warehouseName?.toLowerCase().includes(query) ||
          w.warehouseCode?.toLowerCase().includes(query) ||
          w.companyName?.toLowerCase().includes(query) ||
          w.city?.toLowerCase().includes(query) ||
          w.contactPerson?.toLowerCase().includes(query)
      );
    }

    if (filterStatus === 'ACTIVE') {
      filtered = filtered.filter((w) => w.isActive);
    } else if (filterStatus === 'INACTIVE') {
      filtered = filtered.filter((w) => !w.isActive);
    } else if (filterStatus === 'DEFAULT') {
      filtered = filtered.filter((w) => w.isDefault);
    }

    setFilteredWarehouses(filtered);
  };

  const handleOpenDialog = (warehouse = null) => {
    if (warehouse) {
      setEditingWarehouse(warehouse);
      setFormData({
        warehouseName: warehouse.warehouseName || '',
        warehouseCode: warehouse.warehouseCode || '',
        companyName: warehouse.companyName || '',
        contactPerson: warehouse.contactPerson || '',
        phone: warehouse.phone || '',
        alternatePhone: warehouse.alternatePhone || '',
        email: warehouse.email || '',
        gstNumber: warehouse.gstNumber || '',
        panNumber: warehouse.panNumber || '',
        addressLine1: warehouse.addressLine1 || '',
        addressLine2: warehouse.addressLine2 || '',
        landmark: warehouse.landmark || '',
        city: warehouse.city || '',
        state: warehouse.state || '',
        pincode: warehouse.pincode || '',
        country: warehouse.country || 'India',
        warehouseType: warehouse.warehouseType || 'MAIN',
        dailyCapacity: warehouse.dailyCapacity || '',
        pickupStartTime: warehouse.pickupStartTime || '',
        pickupEndTime: warehouse.pickupEndTime || '',
        workingDays: warehouse.workingDays || [],
        pickupInstructions: warehouse.pickupInstructions || '',
        allowCOD: warehouse.allowCOD || false,
        allowReversePickup: warehouse.allowReversePickup || false,
        isDefault: warehouse.isDefault || false,
        isActive: warehouse.isActive !== undefined ? warehouse.isActive : true,
      });
    } else {
      setEditingWarehouse(null);
      setFormData({
        warehouseName: '',
        warehouseCode: '',
        companyName: '',
        contactPerson: '',
        phone: '',
        alternatePhone: '',
        email: '',
        gstNumber: '',
        panNumber: '',
        addressLine1: '',
        addressLine2: '',
        landmark: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        warehouseType: 'MAIN',
        dailyCapacity: '',
        pickupStartTime: '',
        pickupEndTime: '',
        workingDays: [],
        pickupInstructions: '',
        allowCOD: false,
        allowReversePickup: false,
        isDefault: false,
        isActive: true,
      });
    }
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingWarehouse(null);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.warehouseName.trim()) {
      errors.warehouseName = 'Warehouse name is required';
    }
    if (!formData.companyName.trim()) {
      errors.companyName = 'Company name is required';
    }
    if (!formData.contactPerson.trim()) {
      errors.contactPerson = 'Contact person is required';
    }
    if (!formData.phone) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      errors.phone = 'Phone number must be 10 digits';
    }
    if (formData.alternatePhone && !/^\d{10}$/.test(formData.alternatePhone)) {
      errors.alternatePhone = 'Alternate phone number must be 10 digits';
    }
    if (formData.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      errors.email = 'Invalid email address';
    }
    if (formData.gstNumber && !/^[A-Z0-9]{15}$/.test(formData.gstNumber)) {
      errors.gstNumber = 'GST number must be 15 characters';
    }
    if (formData.panNumber && !/^[A-Z0-9]{10}$/.test(formData.panNumber)) {
      errors.panNumber = 'PAN number must be 10 characters';
    }
    if (!formData.addressLine1.trim()) {
      errors.addressLine1 = 'Address line 1 is required';
    }
    if (!formData.city.trim()) {
      errors.city = 'City is required';
    }
    if (!formData.state.trim()) {
      errors.state = 'State is required';
    }
    if (!formData.pincode) {
      errors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      errors.pincode = 'Pincode must be 6 digits';
    }
    if (formData.pickupStartTime && formData.pickupEndTime) {
      if (formData.pickupStartTime >= formData.pickupEndTime) {
        errors.pickupEndTime = 'Pickup end time must be after start time';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const url = editingWarehouse
        ? `/warehouses/${editingWarehouse._id}`
        : '/warehouses';
      const method = editingWarehouse ? 'put' : 'post';

      const submitData = { ...formData };
      delete submitData.warehouseCode;

      const response = await api[method](url, submitData);

      if (response.data.success) {
        showSnackbar(
          editingWarehouse ? 'Warehouse updated successfully' : 'Warehouse created successfully',
          'success'
        );
        handleCloseDialog();
        fetchWarehouses();
      }
    } catch (error) {
      console.error('Error saving warehouse:', error);
      showSnackbar(
        error.response?.data?.message || 'Failed to save warehouse',
        'error'
      );
    }
  };

  const handleDelete = async () => {
    try {
      const response = await api.delete(`/warehouses/${deleteDialog.warehouseId}`);

      if (response.data.success) {
        showSnackbar('Warehouse deleted successfully', 'success');
        setDeleteDialog({ open: false, warehouseId: null, warehouseName: "" });
        fetchWarehouses();
      }
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      showSnackbar(
        error.response?.data?.message || 'Failed to delete warehouse',
        'error'
      );
    }
  };

  const handleSetDefault = async (warehouseId) => {
    try {
      const response = await api.patch(`/warehouses/${warehouseId}/default`);

      if (response.data.success) {
        showSnackbar('Default warehouse updated successfully', 'success');
        fetchWarehouses();
      }
    } catch (error) {
      console.error('Error setting default warehouse:', error);
      showSnackbar('Failed to set default warehouse', 'error');
    }
  };

  const handleToggleStatus = async (warehouseId, currentStatus) => {
    try {
      const response = await api.put(`/warehouses/${warehouseId}`, {
        isActive: !currentStatus,
      });

      if (response.data.success) {
        showSnackbar(`Warehouse ${!currentStatus ? 'activated' : 'deactivated'} successfully`, 'success');
        fetchWarehouses();
      }
    } catch (error) {
      console.error('Error toggling warehouse status:', error);
      showSnackbar('Failed to update warehouse status', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', severity: 'success' });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusChip = (isActive) => {
    return isActive ? (
      <Chip label="Active" color="success" size="small" />
    ) : (
      <Chip label="Inactive" color="error" size="small" />
    );
  };

  const getTypeChip = (type) => {
    const typeMap = {
      MAIN: { color: 'primary', label: 'Main' },
      BRANCH: { color: 'secondary', label: 'Branch' },
      FULFILLMENT: { color: 'info', label: 'Fulfillment' },
    };
    const config = typeMap[type] || { color: 'default', label: type };
    return <Chip label={config.label} color={config.color} size="small" variant="outlined" />;
  };

  const workingDaysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const renderSkeleton = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <TableRow key={index}>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell><Skeleton variant="rectangular" width={60} height={24} /></TableCell>
        <TableCell><Skeleton variant="rectangular" width={40} height={24} /></TableCell>
        <TableCell><Skeleton variant="rectangular" width={60} height={24} /></TableCell>
        <TableCell><Skeleton variant="rectangular" width={120} height={36} /></TableCell>
      </TableRow>
    ));
  };

  const renderEmptyState = () => (
    <div className="warehouse-empty-state">
      <WarehouseIcon className="warehouse-empty-icon" />
      <Typography className="warehouse-empty-title">
        No Warehouses Found
      </Typography>
      <Typography className="warehouse-empty-subtitle">
        {searchQuery || filterStatus !== 'ALL' 
          ? 'No warehouses match your search criteria' 
          : 'Get started by creating your first warehouse'}
      </Typography>
      {!searchQuery && filterStatus === 'ALL' && (
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Add Warehouse
        </Button>
      )}
    </div>
  );

  return (
    <div className="warehouse-container">
      <div className="warehouse-sidebar">
        <Sidebar />
      </div>

      <main className="warehouse-main">
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Warehouses
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Warehouse
          </Button>
        </Box>

        {/* Stats Cards */}
        <div className="warehouse-stats-grid">
          <div className="warehouse-stat-card">
            <div className="warehouse-stat-label">Total Warehouses</div>
            <div className="warehouse-stat-value">{warehouses.length}</div>
          </div>
          <div className="warehouse-stat-card">
            <div className="warehouse-stat-label">Active</div>
            <div className="warehouse-stat-value success">
              {warehouses.filter((w) => w.isActive).length}
            </div>
          </div>
          <div className="warehouse-stat-card">
            <div className="warehouse-stat-label">Default</div>
            <div className="warehouse-stat-value primary">
              {warehouses.filter((w) => w.isDefault).length}
            </div>
          </div>
          <div className="warehouse-stat-card">
            <div className="warehouse-stat-label">Total Capacity</div>
            <div className="warehouse-stat-value">
              {warehouses.reduce((sum, w) => sum + (parseInt(w.dailyCapacity) || 0), 0)}
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="warehouse-search-filter">
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search warehouses by name, code, company, city, or contact person..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Filter by Status"
                >
                  <MenuItem value="ALL">All</MenuItem>
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                  <MenuItem value="DEFAULT">Default</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </div>

        {/* Warehouse Table */}
        <div className="warehouse-table-wrapper">
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Warehouse</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>City</TableCell>
                  <TableCell>State</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Default</TableCell>
                  <TableCell>COD</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  renderSkeleton()
                ) : filteredWarehouses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ p: 0 }}>
                      {renderEmptyState()}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredWarehouses
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((warehouse) => (
                      <TableRow key={warehouse._id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {warehouse.warehouseName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {getTypeChip(warehouse.warehouseType)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="textSecondary">
                            {warehouse.warehouseCode}
                          </Typography>
                        </TableCell>
                        <TableCell>{warehouse.companyName}</TableCell>
                        <TableCell>{warehouse.city}</TableCell>
                        <TableCell>{warehouse.state}</TableCell>
                        <TableCell>{warehouse.phone}</TableCell>
                        <TableCell>
                          {warehouse.isDefault ? (
                            <Chip label="Default" color="primary" size="small" />
                          ) : (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleSetDefault(warehouse._id)}
                            >
                              Set Default
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          {warehouse.allowCOD ? (
                            <Chip label="Yes" color="success" size="small" />
                          ) : (
                            <Chip label="No" color="default" size="small" />
                          )}
                        </TableCell>
                        <TableCell>{getStatusChip(warehouse.isActive)}</TableCell>
                        <TableCell align="center">
                          <Tooltip title="Toggle Status">
                            <Switch
                              checked={warehouse.isActive}
                              onChange={() => handleToggleStatus(warehouse._id, warehouse.isActive)}
                              size="small"
                            />
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenDialog(warehouse)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() =>
                                setDeleteDialog({
                                  open: true,
                                  warehouseId: warehouse._id,
                                  warehouseName: warehouse.warehouseName,
                                })
                              }
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredWarehouses.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </div>

        {/* Add/Edit Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog} 
          maxWidth="lg" 
          fullWidth
          className="warehouse-dialog"
        >
          <DialogTitle>
            {editingWarehouse ? 'Edit Warehouse' : 'Add New Warehouse'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography className="warehouse-section-title">
                  Basic Information
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Warehouse Name"
                  name="warehouseName"
                  value={formData.warehouseName}
                  onChange={(e) => setFormData({ ...formData, warehouseName: e.target.value })}
                  required
                  error={!!formErrors.warehouseName}
                  helperText={formErrors.warehouseName}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Company Name"
                  name="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  required
                  error={!!formErrors.companyName}
                  helperText={formErrors.companyName}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Person"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  required
                  error={!!formErrors.contactPerson}
                  helperText={formErrors.contactPerson}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  required
                  error={!!formErrors.phone}
                  helperText={formErrors.phone}
                  inputProps={{ maxLength: 10 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Alternate Phone"
                  name="alternatePhone"
                  value={formData.alternatePhone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      alternatePhone: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  error={!!formErrors.alternatePhone}
                  helperText={formErrors.alternatePhone}
                  inputProps={{ maxLength: 10 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="GST Number"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                  error={!!formErrors.gstNumber}
                  helperText={formErrors.gstNumber || '15 characters'}
                  inputProps={{ maxLength: 15 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="PAN Number"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                  error={!!formErrors.panNumber}
                  helperText={formErrors.panNumber || '10 characters'}
                  inputProps={{ maxLength: 10 }}
                />
              </Grid>

              {/* Address */}
              <Grid item xs={12}>
                <Typography className="warehouse-section-title">
                  Address
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address Line 1"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  required
                  error={!!formErrors.addressLine1}
                  helperText={formErrors.addressLine1}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address Line 2"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Landmark"
                  name="landmark"
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                  error={!!formErrors.city}
                  helperText={formErrors.city}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  required
                  error={!!formErrors.state}
                  helperText={formErrors.state}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  required
                  error={!!formErrors.pincode}
                  helperText={formErrors.pincode || '6 digits'}
                  inputProps={{ maxLength: 6 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Country"
                  name="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </Grid>

              {/* Warehouse Details */}
              <Grid item xs={12}>
                <Typography className="warehouse-section-title">
                  Warehouse Details
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Warehouse Type</InputLabel>
                  <Select
                    name="warehouseType"
                    value={formData.warehouseType}
                    onChange={(e) => setFormData({ ...formData, warehouseType: e.target.value })}
                    label="Warehouse Type"
                  >
                    <MenuItem value="MAIN">Main</MenuItem>
                    <MenuItem value="BRANCH">Branch</MenuItem>
                    <MenuItem value="FULFILLMENT">Fulfillment</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Daily Capacity (Orders)"
                  name="dailyCapacity"
                  type="number"
                  value={formData.dailyCapacity}
                  onChange={(e) => setFormData({ ...formData, dailyCapacity: e.target.value })}
                />
              </Grid>

              {/* Pickup Schedule */}
              <Grid item xs={12}>
                <Typography className="warehouse-section-title">
                  Pickup Schedule
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Pickup Start Time"
                  name="pickupStartTime"
                  type="time"
                  value={formData.pickupStartTime}
                  onChange={(e) => setFormData({ ...formData, pickupStartTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Pickup End Time"
                  name="pickupEndTime"
                  type="time"
                  value={formData.pickupEndTime}
                  onChange={(e) => setFormData({ ...formData, pickupEndTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  error={!!formErrors.pickupEndTime}
                  helperText={formErrors.pickupEndTime}
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={workingDaysList}
                  value={formData.workingDays}
                  onChange={(event, newValue) => {
                    setFormData({ ...formData, workingDays: newValue });
                  }}
                  renderInput={(params) => (
                    <MuiTextField
                      {...params}
                      label="Working Days"
                      placeholder="Select working days"
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={option}
                        {...getTagProps({ index })}
                        color="primary"
                        size="small"
                      />
                    ))
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Pickup Instructions"
                  name="pickupInstructions"
                  value={formData.pickupInstructions}
                  onChange={(e) => setFormData({ ...formData, pickupInstructions: e.target.value })}
                  multiline
                  rows={2}
                />
              </Grid>

              {/* Settings */}
              <Grid item xs={12}>
                <Typography className="warehouse-section-title">
                  Settings
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="allowCOD"
                      checked={formData.allowCOD}
                      onChange={(e) => setFormData({ ...formData, allowCOD: e.target.checked })}
                    />
                  }
                  label="Allow COD"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="allowReversePickup"
                      checked={formData.allowReversePickup}
                      onChange={(e) => setFormData({ ...formData, allowReversePickup: e.target.checked })}
                    />
                  }
                  label="Allow Reverse Pickup"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit}>
              {editingWarehouse ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, warehouseId: null, warehouseName: "" })}
          className="warehouse-delete-dialog"
        >
          <DialogTitle>Delete Warehouse</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete{" "}
              <strong>{deleteDialog.warehouseName}</strong>?
              <br />
              <span className="warehouse-delete-warning">This action cannot be undone.</span>
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, warehouseId: null, warehouseName: "" })}>
              Cancel
            </Button>
            <Button variant="contained" color="error" onClick={handleDelete}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </main>
    </div>
  );
};

export default Warehouse;
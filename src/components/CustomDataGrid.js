import React, { useState } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Button, MenuItem, Select, TextField, IconButton } from '@mui/material';
import * as XLSX from 'xlsx';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const columnConfig = [
  { field: 'id', headerName: 'ID', width: 70, type: 'number' },
  { field: 'name', headerName: 'Name', width: 200, editable: true, type: 'string' },
  { field: 'age', headerName: 'Age', width: 100, editable: true, type: 'number' },
  {
    field: 'gender',
    headerName: 'Gender',
    width: 150,
    editable: true,
    renderEditCell: (params) => (
      <Select
        value={params.value}
        onChange={(e) => params.api.setEditCellValue({ id: params.id, field: params.field, value: e.target.value })}
        fullWidth
      >
        <MenuItem value="Male">Male</MenuItem>
        <MenuItem value="Female">Female</MenuItem>
        <MenuItem value="Other">Other</MenuItem>
      </Select>
    )
  },
];

export default function CustomDataGrid() {
  const [rows, setRows] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  const handleAddRow = () => {
    const newId = rows.length > 0 ? rows[rows.length - 1].id + 1 : 1;
    const newRow = { id: newId, name: '', age: '', gender: '' };
    setRows([...rows, newRow]);
  };

  const handleRowEdit = (params) => {
    const updatedRows = rows.map((row) =>
      row.id === params.id ? { ...row, [params.field]: params.value } : row
    );
    setRows(updatedRows);
  };

  const handleDeleteSelected = () => {
    const updatedRows = rows.filter((row) => !selectedRows.includes(row.id));
    setRows(updatedRows);
    setSelectedRows([]);
  };

  const handleImport = (event) => {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      const workbook = XLSX.read(e.target.result, { type: 'binary' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet);
      const formatted = data.map((row, index) => ({
        id: index + 1 + rows.length,
        name: row.Name || '',
        age: row.Age || '',
        gender: row.Gender || '',
      }));
      setRows([...rows, ...formatted]);
    };
    fileReader.readAsBinaryString(event.target.files[0]);
  };

  return (
    <div style={{ height: 600, width: '100%' }}>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <Button variant="contained" onClick={handleAddRow} startIcon={<AddIcon />}>Add Row</Button>
        <Button variant="outlined" color="error" onClick={handleDeleteSelected} startIcon={<DeleteIcon />}>Delete Selected</Button>
        <Button variant="outlined" component="label">
          Import Excel
          <input type="file" hidden accept=".xlsx, .xls" onChange={handleImport} />
        </Button>
      </div>
      <DataGrid
        rows={rows}
        columns={columnConfig}
        checkboxSelection
        disableRowSelectionOnClick
        processRowUpdate={(updatedRow, oldRow) => {
          const errors = [];
        
          if (!updatedRow.name || updatedRow.name.trim() === "") {
            errors.push("Name is required.");
          }
        
          if (
            isNaN(updatedRow.age) ||
            updatedRow.age < 0 ||
            updatedRow.age > 120
          ) {
            errors.push("Age must be a number between 0 and 120.");
          }
        
          const allowedGenders = ["Male", "Female", "Other"];
          if (!allowedGenders.includes(updatedRow.gender)) {
            errors.push("Gender must be one of: Male, Female, Other.");
          }
        
          if (errors.length > 0) {
            alert("Row update failed:\n" + errors.join("\n"));
            return oldRow; // Reject the update
          }
        
          return updatedRow; // Accept the update
        }}
        onRowSelectionModelChange={(ids) => setSelectedRows(ids)}
        experimentalFeatures={{ newEditingApi: true }}
        slots={{ toolbar: GridToolbar }}
      />
    </div>
  );
}
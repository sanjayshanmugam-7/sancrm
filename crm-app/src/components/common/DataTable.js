import React, { useState } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, TableSortLabel, Paper, Checkbox,
  TextField, InputAdornment, IconButton, Typography, Tooltip,
  Menu, MenuItem, Button, Chip, CircularProgress,
} from '@mui/material';
import { Search, FilterList, MoreVert, Delete, Edit, Refresh, Download, ViewColumn } from '@mui/icons-material';

const DataTable = ({
  columns = [],
  rows = [],
  loading = false,
  totalCount,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onSort,
  orderBy,
  order,
  selectable = true,
  onSelectionChange,
  onRowClick,
  searchable = true,
  onSearch,
  searchPlaceholder = 'Search...',
  actions = [],
  bulkActions = [],
  title,
  emptyMessage = 'No data found',
  stickyHeader = true,
  dense = false,
  sx,
}) => {
  const [selected, setSelected] = useState([]);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const [localSearch, setLocalSearch] = useState('');

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const newSelected = rows.map((r, i) => r.id || i);
      setSelected(newSelected);
      onSelectionChange?.(newSelected);
    } else {
      setSelected([]);
      onSelectionChange?.([]);
    }
  };

  const handleSelect = (id) => {
    const idx = selected.indexOf(id);
    let newSelected;
    if (idx === -1) {
      newSelected = [...selected, id];
    } else {
      newSelected = selected.filter(s => s !== id);
    }
    setSelected(newSelected);
    onSelectionChange?.(newSelected);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const handleSearch = (e) => {
    setLocalSearch(e.target.value);
    onSearch?.(e.target.value);
  };

  const displayRows = onSearch ? rows : rows.filter(row =>
    columns.some(col => {
      const val = col.accessor ? row[col.accessor] : '';
      return val?.toString().toLowerCase().includes(localSearch.toLowerCase());
    })
  );

  const handleRowMenuOpen = (e, row) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setActiveRow(row);
  };

  return (
    <Box sx={{ width: '100%', ...sx }}>
      {/* Toolbar */}
      {(title || searchable || actions.length > 0 || selected.length > 0) && (
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, flexWrap: 'wrap',
          bgcolor: selected.length > 0 ? 'primary.lighter' : 'transparent',
          p: selected.length > 0 ? 1.5 : 0,
          borderRadius: selected.length > 0 ? 2 : 0,
          border: selected.length > 0 ? '1px solid' : 'none',
          borderColor: 'primary.light',
        }}>
          {selected.length > 0 ? (
            <>
              <Typography variant="subtitle2" color="primary" fontWeight={700}>
                {selected.length} selected
              </Typography>
              <Box sx={{ flex: 1 }} />
              {bulkActions.map((action, i) => (
                <Button key={i} size="small" variant={action.variant || 'outlined'} color={action.color || 'primary'}
                  startIcon={action.icon} onClick={() => action.onClick(selected)} sx={{ borderRadius: 2 }}>
                  {action.label}
                </Button>
              ))}
              <Button size="small" color="error" variant="outlined" startIcon={<Delete />}
                onClick={() => { setSelected([]); onSelectionChange?.([]); }} sx={{ borderRadius: 2 }}>
                Clear
              </Button>
            </>
          ) : (
            <>
              {title && <Typography variant="subtitle1" fontWeight={700}>{title}</Typography>}
              {searchable && (
                <TextField
                  size="small"
                  placeholder={searchPlaceholder}
                  value={localSearch}
                  onChange={handleSearch}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment>,
                    sx: { borderRadius: 2, fontSize: '0.875rem', bgcolor: '#f4f6f8', '& fieldset': { border: 'none' } },
                  }}
                  sx={{ width: 260 }}
                />
              )}
              <Box sx={{ flex: 1 }} />
              {actions.map((action, i) => (
                <Tooltip key={i} title={action.tooltip || action.label}>
                  <span>
                    <Button size="small" variant={action.variant || 'outlined'} color={action.color || 'primary'}
                      startIcon={action.icon} onClick={action.onClick} disabled={action.disabled}
                      sx={{ borderRadius: 2, fontSize: '0.8rem' }}>
                      {action.label}
                    </Button>
                  </span>
                </Tooltip>
              ))}
            </>
          )}
        </Box>
      )}

      {/* Table */}
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'auto' }}>
        <Table stickyHeader={stickyHeader} size={dense ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox" sx={{ bgcolor: '#f4f6f8' }}>
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < rows.length}
                    checked={rows.length > 0 && selected.length === rows.length}
                    onChange={handleSelectAll}
                    size="small"
                  />
                </TableCell>
              )}
              {columns.map((col) => (
                <TableCell
                  key={col.id || col.accessor}
                  align={col.align || 'left'}
                  sx={{ bgcolor: '#f4f6f8', whiteSpace: 'nowrap', minWidth: col.minWidth, maxWidth: col.maxWidth }}
                >
                  {col.sortable !== false && onSort ? (
                    <TableSortLabel
                      active={orderBy === (col.id || col.accessor)}
                      direction={orderBy === (col.id || col.accessor) ? order : 'asc'}
                      onClick={() => onSort(col.id || col.accessor)}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : col.label}
                </TableCell>
              ))}
              {(actions.length > 0 || true) && (
                <TableCell align="right" sx={{ bgcolor: '#f4f6f8', width: 60 }}>Actions</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (selectable ? 2 : 1)} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={32} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Loading...</Typography>
                </TableCell>
              </TableRow>
            ) : displayRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (selectable ? 2 : 1)} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">{emptyMessage}</Typography>
                </TableCell>
              </TableRow>
            ) : displayRows.map((row, rowIdx) => {
              const rowId = row.id || rowIdx;
              const sel = isSelected(rowId);
              return (
                <TableRow
                  key={rowId}
                  hover
                  selected={sel}
                  onClick={() => onRowClick?.(row)}
                  sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {selectable && (
                    <TableCell padding="checkbox">
                      <Checkbox size="small" checked={sel} onChange={() => handleSelect(rowId)} onClick={(e) => e.stopPropagation()} />
                    </TableCell>
                  )}
                  {columns.map((col) => (
                    <TableCell key={col.id || col.accessor} align={col.align || 'left'} sx={{ maxWidth: col.maxWidth, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: col.wrap ? 'normal' : 'nowrap' }}>
                      {col.render ? col.render(row[col.accessor], row) : row[col.accessor] ?? '-'}
                    </TableCell>
                  ))}
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <IconButton size="small" onClick={(e) => handleRowMenuOpen(e, row)}>
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {onPageChange && (
        <TablePagination
          component="div"
          count={totalCount ?? displayRows.length}
          page={page ?? 0}
          onPageChange={onPageChange}
          rowsPerPage={rowsPerPage ?? 10}
          onRowsPerPageChange={onRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 0 }}
        />
      )}

      {/* Row Actions Menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => { setMenuAnchor(null); setActiveRow(null); }}
        PaperProps={{ elevation: 2, sx: { minWidth: 160, borderRadius: 2 } }}>
        {(activeRow?.rowActions || [
          { label: 'View', icon: <Edit fontSize="small" /> },
          { label: 'Edit', icon: <Edit fontSize="small" /> },
          { label: 'Delete', icon: <Delete fontSize="small" />, color: 'error.main' },
        ]).map((action, i) => (
          <MenuItem key={i} onClick={() => { action.onClick?.(activeRow); setMenuAnchor(null); }}
            sx={{ fontSize: '0.875rem', color: action.color, gap: 1.5, py: 0.75 }}>
            {action.icon}
            {action.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default DataTable;

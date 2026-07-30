import React, { useState } from 'react';
import { Paper, InputBase, IconButton, Box } from '@mui/material';
import { Search, Close } from '@mui/icons-material';

const SearchBar = ({ placeholder = 'Search...', value, onChange, onClear, sx, width = 300 }) => {
  const [focused, setFocused] = useState(false);
  const isControlled = value !== undefined;
  const [localValue, setLocalValue] = useState('');

  const currentValue = isControlled ? value : localValue;

  const handleChange = (e) => {
    if (!isControlled) setLocalValue(e.target.value);
    onChange?.(e.target.value);
  };

  const handleClear = () => {
    if (!isControlled) setLocalValue('');
    onChange?.('');
    onClear?.();
  };

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        alignItems: 'center',
        width,
        bgcolor: focused ? '#fff' : '#f4f6f8',
        border: '1px solid',
        borderColor: focused ? 'primary.main' : 'transparent',
        borderRadius: 2,
        px: 1.5,
        py: 0.5,
        transition: 'all 0.2s',
        ...sx,
      }}
    >
      <Search sx={{ color: 'text.secondary', fontSize: 18, mr: 1 }} />
      <InputBase
        placeholder={placeholder}
        value={currentValue}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        sx={{ flex: 1, fontSize: '0.875rem', '& input': { p: 0 } }}
      />
      {currentValue && (
        <IconButton size="small" onClick={handleClear} sx={{ p: 0.25, ml: 0.5 }}>
          <Close sx={{ fontSize: 14 }} />
        </IconButton>
      )}
    </Paper>
  );
};

export default SearchBar;

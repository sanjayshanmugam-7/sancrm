import React from 'react';
import {
  TextField, FormControl, InputLabel, Select, MenuItem,
  FormHelperText, Autocomplete, Box, Typography, Switch,
  FormControlLabel, Chip, OutlinedInput, Checkbox, RadioGroup,
  Radio, FormLabel,
} from '@mui/material';

const FormField = ({
  type = 'text',
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  required,
  disabled,
  placeholder,
  options = [],
  multiple = false,
  rows = 3,
  fullWidth = true,
  size = 'small',
  startAdornment,
  endAdornment,
  inputProps,
  sx,
  ...rest
}) => {
  const commonProps = {
    name,
    label,
    value: value ?? '',
    onChange,
    onBlur,
    error: Boolean(error),
    helperText: error || helperText,
    required,
    disabled,
    placeholder,
    fullWidth,
    size,
    sx: { ...sx },
    ...rest,
  };

  if (type === 'textarea') {
    return (
      <TextField
        {...commonProps}
        multiline
        rows={rows}
      />
    );
  }

  if (type === 'select') {
    return (
      <FormControl fullWidth={fullWidth} size={size} error={Boolean(error)} sx={sx}>
        <InputLabel required={required}>{label}</InputLabel>
        <Select
          name={name}
          value={value ?? ''}
          onChange={onChange}
          onBlur={onBlur}
          label={label}
          disabled={disabled}
          multiple={multiple}
          input={<OutlinedInput label={label} />}
          renderValue={multiple ? (selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((val) => (
                <Chip key={val} label={options.find(o => o.value === val)?.label || val} size="small" />
              ))}
            </Box>
          ) : undefined}
        >
          {!required && !multiple && <MenuItem value=""><em>All / None</em></MenuItem>}
          {options.map((opt) => {
            const optValue = typeof opt === 'string' ? opt : opt.value;
            const optLabel = typeof opt === 'string' ? opt : opt.label;
            return (
              <MenuItem key={optValue} value={optValue}>
                {multiple && <Checkbox checked={(value || []).indexOf(optValue) > -1} size="small" />}
                {optLabel}
              </MenuItem>
            );
          })}
        </Select>
        {(error || helperText) && <FormHelperText>{error || helperText}</FormHelperText>}
      </FormControl>
    );
  }

  if (type === 'autocomplete') {
    return (
      <Autocomplete
        options={options}
        value={value || null}
        onChange={(e, newValue) => onChange({ target: { name, value: newValue } })}
        getOptionLabel={(opt) => typeof opt === 'string' ? opt : opt.label || ''}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            error={Boolean(error)}
            helperText={error || helperText}
            required={required}
            size={size}
            placeholder={placeholder}
          />
        )}
        fullWidth={fullWidth}
        disabled={disabled}
        sx={sx}
      />
    );
  }

  if (type === 'switch') {
    return (
      <FormControlLabel
        control={
          <Switch
            name={name}
            checked={Boolean(value)}
            onChange={(e) => onChange({ target: { name, value: e.target.checked } })}
            disabled={disabled}
            size={size}
          />
        }
        label={<Typography variant="body2" fontWeight={500}>{label}{required && ' *'}</Typography>}
        sx={sx}
      />
    );
  }

  if (type === 'radio') {
    return (
      <FormControl component="fieldset" error={Boolean(error)} sx={sx}>
        <FormLabel component="legend" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{label}{required && ' *'}</FormLabel>
        <RadioGroup name={name} value={value || ''} onChange={onChange} row>
          {options.map((opt) => {
            const optValue = typeof opt === 'string' ? opt : opt.value;
            const optLabel = typeof opt === 'string' ? opt : opt.label;
            return (
              <FormControlLabel key={optValue} value={optValue} control={<Radio size="small" />}
                label={<Typography variant="body2">{optLabel}</Typography>} />
            );
          })}
        </RadioGroup>
        {(error || helperText) && <FormHelperText>{error || helperText}</FormHelperText>}
      </FormControl>
    );
  }

  if (type === 'tags') {
    const tags = Array.isArray(value) ? value : [];
    return (
      <Autocomplete
        multiple
        freeSolo
        options={options.map(o => typeof o === 'string' ? o : o.label)}
        value={tags}
        onChange={(e, newVal) => onChange({ target: { name, value: newVal } })}
        renderTags={(val, getTagProps) =>
          val.map((opt, idx) => (
            <Chip variant="outlined" label={opt} size="small" {...getTagProps({ index: idx })} />
          ))
        }
        renderInput={(params) => (
          <TextField {...params} label={label} placeholder={placeholder || 'Add tags...'} error={Boolean(error)}
            helperText={error || helperText} required={required} size={size} />
        )}
        fullWidth={fullWidth}
        disabled={disabled}
        sx={sx}
      />
    );
  }

  return (
    <TextField
      {...commonProps}
      type={type}
      InputProps={{
        startAdornment,
        endAdornment,
        inputProps,
      }}
    />
  );
};

export default FormField;

import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip,
  Table, TableBody, TableCell, TableHead, TableRow, LinearProgress,
  Alert, Divider, IconButton, Avatar, Tooltip, List, ListItem,
  ListItemText, ListItemAvatar, TextField, Paper
} from '@mui/material';
import {
  DocumentScanner, Upload, CheckCircle, Error, HourglassEmpty,
  Download, Visibility, Delete, ContentCopy, Edit, CloudUpload
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';

const mockDocuments = [
  { id: 1, filename: 'invoice_nov_2024.pdf', type: 'Invoice', status: 'Processed', confidence: 96, uploadedAt: '2024-11-12', fields: { 'Invoice No': 'INV-2024-4521', 'Date': '10 Nov 2024', 'Amount': '₹48,300', 'GST No': '27AABCC1234D1Z5', 'Vendor': 'TechSupplies Ltd' } },
  { id: 2, filename: 'purchase_order_oct.jpg', type: 'Purchase Order', status: 'Processed', confidence: 88, uploadedAt: '2024-11-10', fields: { 'PO No': 'PO-2024-0892', 'Date': '01 Oct 2024', 'Amount': '₹1,25,000', 'Vendor': 'ABC Corp' } },
  { id: 3, filename: 'business_card_mohan.jpg', type: 'Business Card', status: 'Processed', confidence: 92, uploadedAt: '2024-11-08', fields: { 'Name': 'Mohan Patel', 'Company': 'TechCorp Ltd', 'Phone': '+91-9876543210', 'Email': 'mohan@techcorp.com' } },
  { id: 4, filename: 'contract_xyz.pdf', type: 'Contract', status: 'Processing', confidence: 0, uploadedAt: '2024-11-15', fields: {} },
  { id: 5, filename: 'receipt_nov5.jpg', type: 'Receipt', status: 'Failed', confidence: 0, uploadedAt: '2024-11-05', fields: {} },
];

const statusConfig = {
  Processed: { color: 'success', icon: <CheckCircle fontSize="small" /> },
  Processing: { color: 'warning', icon: <HourglassEmpty fontSize="small" /> },
  Failed: { color: 'error', icon: <Error fontSize="small" /> },
};

export default function OCRDocuments() {
  const [selected, setSelected] = useState(mockDocuments[0]);
  const [dragging, setDragging] = useState(false);

  const getConfidenceColor = (v) => v >= 90 ? 'success' : v >= 75 ? 'warning' : 'error';

  return (
    <Box>
      <PageHeader
        title="OCR Documents"
        subtitle="Extract structured data from uploaded documents using AI"
      />

      <Alert severity="info" sx={{ mb: 3 }}>
        Upload invoices, receipts, purchase orders, business cards, or contracts to automatically extract data using AI-powered OCR.
      </Alert>

      <Grid container spacing={3}>
        {/* Upload + List */}
        <Grid item xs={12} md={5}>
          {/* Upload Zone */}
          <Card
            sx={{
              mb: 3, border: `2px dashed ${dragging ? '#1976d2' : '#e0e0e0'}`,
              bgcolor: dragging ? '#e3f2fd' : '#fafafa', cursor: 'pointer', transition: 'all 0.2s'
            }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); }}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <CloudUpload sx={{ fontSize: 48, color: '#1976d2', mb: 1 }} />
              <Typography variant="h6" gutterBottom>Drag & Drop Documents</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Supports PDF, JPG, PNG, TIFF (max 10MB)
              </Typography>
              <Button variant="contained" startIcon={<Upload />} sx={{ mt: 1 }}>
                Browse Files
              </Button>
            </CardContent>
          </Card>

          {/* Document List */}
          <Card>
            <CardContent sx={{ pb: 0 }}>
              <Typography variant="h6" gutterBottom>Uploaded Documents ({mockDocuments.length})</Typography>
            </CardContent>
            <List>
              {mockDocuments.map((doc) => {
                const sc = statusConfig[doc.status];
                return (
                  <ListItem
                    key={doc.id} button divider
                    selected={selected?.id === doc.id}
                    onClick={() => setSelected(doc)}
                    sx={{ '&.Mui-selected': { bgcolor: '#e3f2fd' } }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: doc.status === 'Processed' ? '#e8f5e9' : doc.status === 'Processing' ? '#fff8e1' : '#ffebee',
                        color: doc.status === 'Processed' ? '#388e3c' : doc.status === 'Processing' ? '#f57c00' : '#d32f2f' }}>
                        <DocumentScanner />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={doc.filename}
                      secondary={
                        <span>
                          <Chip label={doc.type} size="small" sx={{ mr: 0.5, height: 16, fontSize: '0.65rem' }} />
                          <Chip label={doc.status} size="small" color={sc.color} sx={{ height: 16, fontSize: '0.65rem' }} />
                        </span>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          </Card>
        </Grid>

        {/* Extracted Data Panel */}
        <Grid item xs={12} md={7}>
          {selected ? (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6">{selected.filename}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Chip label={selected.type} size="small" variant="outlined" />
                      <Chip label={selected.status} size="small" color={statusConfig[selected.status].color} />
                      {selected.confidence > 0 && (
                        <Chip label={`${selected.confidence}% confidence`} size="small"
                          color={getConfidenceColor(selected.confidence)} variant="outlined" />
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Download Original"><IconButton size="small"><Download fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton size="small" color="error"><Delete fontSize="small" /></IconButton></Tooltip>
                  </Box>
                </Box>
                <Divider sx={{ mb: 3 }} />

                {selected.status === 'Processing' && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <HourglassEmpty sx={{ fontSize: 48, color: '#f57c00', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>Processing Document...</Typography>
                    <LinearProgress sx={{ mt: 2, mx: 4 }} />
                    <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                      Estimated time: 15–30 seconds
                    </Typography>
                  </Box>
                )}

                {selected.status === 'Failed' && (
                  <Alert severity="error">
                    OCR processing failed. The document may be too blurry, corrupted, or in an unsupported format. Please try uploading a higher quality version.
                    <Button size="small" sx={{ mt: 1 }} startIcon={<Upload />}>Re-upload</Button>
                  </Alert>
                )}

                {selected.status === 'Processed' && (
                  <>
                    {selected.confidence > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>Confidence Score</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <LinearProgress variant="determinate" value={selected.confidence}
                            sx={{ flex: 1, height: 8, borderRadius: 4 }}
                            color={getConfidenceColor(selected.confidence)} />
                          <Typography variant="body2" fontWeight={600}>{selected.confidence}%</Typography>
                        </Box>
                      </Box>
                    )}
                    <Typography variant="subtitle2" gutterBottom>Extracted Fields</Typography>
                    <Box sx={{ bgcolor: '#f8f9fa', borderRadius: 2, p: 2, mb: 3 }}>
                      {Object.entries(selected.fields).map(([key, value]) => (
                        <Box key={key} sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ width: 130, flexShrink: 0 }}>{key}</Typography>
                          <TextField size="small" value={value} sx={{ flex: 1 }}
                            InputProps={{ endAdornment: <Tooltip title="Copy"><IconButton size="small" onClick={() => navigator.clipboard.writeText(value)}><ContentCopy fontSize="small" /></IconButton></Tooltip> }} />
                        </Box>
                      ))}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button variant="contained" startIcon={<Edit />}>Save to CRM</Button>
                      <Button variant="outlined" startIcon={<ContentCopy />}>Copy All Data</Button>
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box>
                <DocumentScanner sx={{ fontSize: 60, color: '#bdbdbd', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">Select a document to view extracted data</Typography>
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

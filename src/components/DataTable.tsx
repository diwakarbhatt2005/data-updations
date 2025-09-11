import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Edit3, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Loader2,
  AlertCircle,
  Upload
} from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { BulkAddModal } from '@/components/BulkAddModal';

export const DataTable = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [newColumnName, setNewColumnName] = useState('');
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  
  const {
    tableData,
    selectedDatabase,
    isEditMode,
    error,
    setEditMode,
    updateCell,
    addRow,
    addMultipleRows,
    deleteRow,
    resetToOriginal,
    saveChanges,
    setError,
  } = useDashboardStore();

  const columns = useMemo(() => {
    if (tableData.length === 0) return [];
    return Object.keys(tableData[0]);
  }, [tableData]);

  const handleCellChange = useCallback((rowIndex: number, field: string, value: string) => {
    updateCell(rowIndex, field, value);
  }, [updateCell]);

  const handlePaste = useCallback((e: React.ClipboardEvent, rowIndex: number, field: string) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    // Support both tab and comma separated data
    const rows = pastedData.split('\n').filter(row => row.trim());
    
    if (rows.length === 0) {
      toast({
        title: "Paste Error",
        description: "No valid data found to paste.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate and detect delimiter
    const sampleRow = rows[0];
    const delimiter = sampleRow.includes('\t') ? '\t' : ',';
    
    // Calculate how many new rows we need
    const neededRows = Math.max(0, (rowIndex + rows.length) - tableData.length);
    
    // Add required rows all at once
    if (neededRows > 0) {
      addMultipleRows(neededRows);
    }
    
    // Use setTimeout to ensure rows are added before updating cells
    setTimeout(() => {
      let pastedCells = 0;
      let truncatedCells = 0;
      const startFieldIndex = columns.indexOf(field);
      
      rows.forEach((row, rowOffset) => {
        const cells = row.split(delimiter).map(cell => cell.trim().replace(/^"|"$/g, ''));
        const currentRowIndex = rowIndex + rowOffset;
        
        cells.forEach((cell, cellIndex) => {
          const fieldIndex = startFieldIndex + cellIndex;
          const currentField = columns[fieldIndex];
          
          if (currentField && currentRowIndex < tableData.length + neededRows) {
            updateCell(currentRowIndex, currentField, cell);
            pastedCells++;
          } else if (!currentField) {
            truncatedCells++;
          }
        });
      });
      
      toast({
        title: "Data Pasted Successfully",
        description: `Pasted ${pastedCells} cells across ${rows.length} rows.${truncatedCells > 0 ? ` ${truncatedCells} cells were truncated.` : ''}`,
      });
    }, 200);
  }, [columns, tableData, updateCell, addMultipleRows, toast]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      // Mock save - simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Save changes to original data to persist them
      saveChanges();
      toast({
        title: "Success",
        description: "Data updated successfully!",
      });
    } catch (err) {
      setError('Failed to save changes. Please try again.');
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };



  if (tableData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-lg border bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold text-foreground">
                {selectedDatabase?.replace('admin_panel_db/', '').replace('_', ' ').toUpperCase()}
              </CardTitle>
              <p className="text-muted-foreground mt-2 text-lg">
                {tableData.length} records • {columns.length} columns
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {!isEditMode ? (
                <Button
                  onClick={() => setEditMode(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-smooth px-6 py-2"
                  size="lg"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Mode
                </Button>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={resetToOriginal}
                    variant="outline"
                    className="border-destructive text-destructive hover:bg-destructive hover:text-white transition-smooth"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-accent hover:bg-accent/90 text-white shadow-lg transition-smooth px-6 py-2"
                    size="lg"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Row Actions (only in edit mode) */}
      {isEditMode && (
        <Card className="shadow-md border bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
              <div className="flex items-center space-x-3 flex-wrap">
                <Button
                  onClick={addRow}
                  variant="outline"
                  className="border-accent text-accent hover:bg-accent hover:text-white transition-smooth"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Row
                </Button>
                <Button
                  onClick={() => setShowBulkAddModal(true)}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-white transition-smooth"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Bulk Add
                </Button>
                <Button
                  onClick={resetToOriginal}
                  variant="outline"
                  className="border-muted-foreground text-muted-foreground hover:bg-muted transition-smooth"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset All
                </Button>
              </div>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <Card className="shadow-lg border bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="overflow-auto max-h-[65vh] relative rounded-lg">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-primary text-primary-foreground z-10 shadow-sm">
                <tr>
                  {isEditMode && (
                    <th className="px-3 py-4 text-left font-semibold bg-primary sticky left-0 z-20 border-r border-primary-foreground/20">
                      Actions
                    </th>
                  )}
                  {columns.map((column, index) => (
                    <th key={column} className={`px-4 py-4 text-left font-semibold min-w-[150px] bg-primary ${index === 0 && !isEditMode ? 'sticky left-0 z-20 border-r border-primary-foreground/20' : ''}`}>
                      <span className="text-sm uppercase tracking-wide">
                        {column.replace('_', ' ')}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, rowIndex) => (
                  <tr 
                    key={rowIndex}
                    className="border-b border-border hover:bg-muted/50 transition-colors duration-200"
                  >
                    {isEditMode && (
                      <td className="px-3 py-3 sticky left-0 bg-card z-15 border-r border-border">
                        <Button
                          onClick={() => deleteRow(rowIndex)}
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 border-destructive text-destructive hover:bg-destructive hover:text-white transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </td>
                    )}
                    {columns.map((column, colIndex) => (
                      <td key={`${rowIndex}-${column}`} className={`px-4 py-3 ${colIndex === 0 && !isEditMode ? 'sticky left-0 bg-card z-15 border-r border-border' : ''}`}>
                        {isEditMode ? (
                          <Input
                            value={row[column] || ''}
                            onChange={(e) => handleCellChange(rowIndex, column, e.target.value)}
                            onPaste={(e) => handlePaste(e, rowIndex, column)}
                            className="h-9 text-sm border-input focus:border-primary transition-colors"
                            placeholder={`Enter ${column.replace('_', ' ')}`}
                          />
                        ) : (
                          <span className="text-foreground text-sm">
                            {row[column] || (
                              <span className="text-muted-foreground italic">empty</span>
                            )}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Footer info */}
          <div className="px-6 py-4 border-t border-border bg-muted/30">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>
                Showing {tableData.length} record{tableData.length !== 1 ? 's' : ''}
              </span>
              {isEditMode && (
                <span className="text-primary font-medium">
                  🔄 Edit mode active • Use Bulk Add for large datasets
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Add Modal */}
      <BulkAddModal 
        isOpen={showBulkAddModal} 
        onClose={() => setShowBulkAddModal(false)} 
      />
    </div>
  );
};
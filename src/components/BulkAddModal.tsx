import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDashboardStore } from '@/store/dashboardStore';

interface BulkAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BulkAddModal = ({ isOpen, onClose }: BulkAddModalProps) => {
  const { toast } = useToast();
  const [bulkData, setBulkData] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { addMultipleRows, updateCell, tableData } = useDashboardStore();

  const handleBulkAdd = async () => {
    if (!bulkData.trim()) {
      toast({
        title: "Error",
        description: "Please paste some data first.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const rows = bulkData.trim().split('\n').filter(row => row.trim());
      
      if (rows.length > 500) {
        toast({
          title: "Too Many Rows",
          description: "Maximum 500 rows allowed. Please reduce your data.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // Detect delimiter (prefer tabs, fallback to commas)
      const sampleRow = rows[0];
      const delimiter = sampleRow.includes('\t') ? '\t' : ',';

      // Get column headers from first data row
      const columns = tableData.length > 0 ? Object.keys(tableData[0]) : [];
      
      if (columns.length === 0) {
        toast({
          title: "No Table Structure",
          description: "No existing table structure found. Please add data normally first.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // Add all rows at once
      const startIndex = tableData.length;
      addMultipleRows(rows.length);

      // Process data after a brief delay to ensure rows are added
      setTimeout(() => {
        let totalCells = 0;
        let truncatedCells = 0;

        rows.forEach((row, rowOffset) => {
          const cells = row.split(delimiter).map(cell => 
            cell.trim().replace(/^"|"$/g, '')
          );
          
          const currentRowIndex = startIndex + rowOffset;

          cells.forEach((cell, cellIndex) => {
            if (cellIndex < columns.length) {
              const column = columns[cellIndex];
              updateCell(currentRowIndex, column, cell);
              totalCells++;
            } else {
              truncatedCells++;
            }
          });
        });

        toast({
          title: "Bulk Data Added Successfully",
          description: `Added ${rows.length} rows with ${totalCells} cells.${truncatedCells > 0 ? ` ${truncatedCells} cells were truncated.` : ''}`,
        });

        setBulkData('');
        onClose();
        setIsProcessing(false);
      }, 300);

    } catch (error) {
      toast({
        title: "Error Processing Data",
        description: "Failed to process bulk data. Please check the format and try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setBulkData('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Bulk Add Data</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Paste up to 500 rows of data from spreadsheets (Excel, Google Sheets). 
              Use tabs or commas to separate columns. Data will be added to the existing table structure.
            </AlertDescription>
          </Alert>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Paste your data below:
            </label>
            <Textarea
              placeholder="Paste spreadsheet data here...&#10;Example:&#10;John Doe,Manager,50000&#10;Jane Smith,Developer,60000&#10;..."
              value={bulkData}
              onChange={(e) => setBulkData(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />
          </div>

          {bulkData && (
            <div className="text-sm text-muted-foreground">
              {bulkData.split('\n').filter(row => row.trim()).length} rows detected
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleBulkAdd}
            disabled={isProcessing || !bulkData.trim()}
            className="bg-accent hover:bg-accent/90"
          >
            {isProcessing ? (
              <>Processing...</>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Add Data
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
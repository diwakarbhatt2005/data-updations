import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Database, Loader2, AlertCircle } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const DatabaseSelector = () => {
  const navigate = useNavigate();
  const [selectedDb, setSelectedDb] = useState<string>('');
  
  const {
    databases,
    isLoading,
    error,
    setDatabases,
    setSelectedDatabase,
    setTableData,
    setLoading,
    setError,
  } = useDashboardStore();

  // Fetch databases on component mount
  useEffect(() => {
    fetchDatabases();
  }, []);

  const fetchDatabases = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Using mock data
      const mockDatabases = [
        'admin_panel_db/student_data',
        'admin_panel_db/employee_data', 
        'admin_panel_db/sales_data',
        'admin_panel_db/inventory_data',
        'admin_panel_db/customer_data'
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDatabases(mockDatabases);
    } catch (err) {
      setError('Failed to fetch databases. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDatabaseSelect = async () => {
    if (!selectedDb) return;

    try {
      setLoading(true);
      setError(null);
      setSelectedDatabase(selectedDb);

      // Using mock data based on selected database
      const mockData = generateMockData(selectedDb);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setTableData(mockData);
      
      // Navigate to data view page
      navigate('/view-data');
    } catch (err) {
      setError('Failed to fetch data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (dbName: string) => {
    const baseData = {
      'admin_panel_db/student_data': [
        { id: 1, name: 'John Doe', email: 'john@example.com', grade: 'A', course: 'Computer Science' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', grade: 'B+', course: 'Mathematics' },
        { id: 3, name: 'Mike Johnson', email: 'mike@example.com', grade: 'A-', course: 'Physics' },
        { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', grade: 'A+', course: 'Chemistry' },
        { id: 5, name: 'David Brown', email: 'david@example.com', grade: 'B', course: 'Biology' },
      ],
      'admin_panel_db/employee_data': [
        { id: 1, name: 'Alice Cooper', position: 'Manager', department: 'HR', salary: 75000 },
        { id: 2, name: 'Bob Miller', position: 'Developer', department: 'IT', salary: 65000 },
        { id: 3, name: 'Carol Davis', position: 'Designer', department: 'Marketing', salary: 60000 },
        { id: 4, name: 'Dan Wilson', position: 'Analyst', department: 'Finance', salary: 55000 },
      ],
      'admin_panel_db/sales_data': [
        { id: 1, product: 'Laptop', price: 999, quantity: 50, revenue: 49950 },
        { id: 2, product: 'Mouse', price: 25, quantity: 200, revenue: 5000 },
        { id: 3, product: 'Keyboard', price: 75, quantity: 100, revenue: 7500 },
        { id: 4, product: 'Monitor', price: 300, quantity: 30, revenue: 9000 },
      ],
      'admin_panel_db/inventory_data': [
        { id: 1, item: 'Office Chair', stock: 25, category: 'Furniture', location: 'Warehouse A' },
        { id: 2, item: 'Desk Lamp', stock: 40, category: 'Lighting', location: 'Warehouse B' },
        { id: 3, item: 'Filing Cabinet', stock: 15, category: 'Storage', location: 'Warehouse A' },
      ],
      'admin_panel_db/customer_data': [
        { id: 1, name: 'ABC Corp', email: 'contact@abc.com', phone: '555-0123', status: 'Active' },
        { id: 2, name: 'XYZ Ltd', email: 'info@xyz.com', phone: '555-0456', status: 'Pending' },
        { id: 3, name: 'Tech Solutions', email: 'hello@tech.com', phone: '555-0789', status: 'Active' },
      ]
    };
    
    return baseData[dbName as keyof typeof baseData] || [];
  };

  return (
    <div className="min-h-screen bg-dashboard-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="bg-gradient-card shadow-elevation border-0">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto shadow-primary">
              <Database className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Database Admin Dashboard
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                Select a table to view and manage your data
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Select a Table to View
              </label>
              <Select 
                value={selectedDb} 
                onValueChange={setSelectedDb}
                disabled={isLoading}
              >
                <SelectTrigger className="h-12 border-2 transition-smooth focus:border-primary hover:border-primary/50">
                  <SelectValue placeholder="Choose Table..." />
                </SelectTrigger>
                <SelectContent className="bg-white shadow-elevation border-0">
                  {databases.map((db) => (
                    <SelectItem 
                      key={db} 
                      value={db}
                      className="hover:bg-gradient-hover transition-smooth"
                    >
                      {db.replace('admin_panel_db/', '').replace('_', ' ').toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleDatabaseSelect}
              disabled={!selectedDb || isLoading}
              className="w-full h-12 bg-gradient-primary hover:bg-primary-hover text-white font-medium shadow-primary transition-smooth disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load Table'
              )}
            </Button>

            {isLoading && !error && (
              <div className="text-center text-sm text-muted-foreground">
                Fetching table information...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
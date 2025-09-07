import { create } from 'zustand';

export interface DatabaseRow {
  [key: string]: any;
}

export interface DashboardState {
  // Database selection
  databases: string[];
  selectedDatabase: string | null;
  
  // Data table
  tableData: DatabaseRow[];
  originalData: DatabaseRow[];
  isEditMode: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Chatbot
  chatMessages: Array<{ id: string; text: string; isUser: boolean; timestamp: Date }>;
  isChatOpen: boolean;
  isChatLoading: boolean;
  
  // Actions
  setDatabases: (databases: string[]) => void;
  setSelectedDatabase: (database: string) => void;
  setTableData: (data: DatabaseRow[]) => void;
  setEditMode: (isEdit: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  updateCell: (rowIndex: number, field: string, value: any) => void;
  addRow: () => void;
  deleteRow: (rowIndex: number) => void;
  resetToOriginal: () => void;
  
  // Chat actions
  setChatOpen: (isOpen: boolean) => void;
  addChatMessage: (text: string, isUser: boolean) => void;
  setChatLoading: (isLoading: boolean) => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  // Initial state
  databases: [],
  selectedDatabase: null,
  tableData: [],
  originalData: [],
  isEditMode: false,
  isLoading: false,
  error: null,
  chatMessages: [
    {
      id: '1',
      text: 'Hello! I\'m your AI assistant. How can I help you with your database management today?',
      isUser: false,
      timestamp: new Date(),
    },
  ],
  isChatOpen: false,
  isChatLoading: false,

  // Actions
  setDatabases: (databases) => set({ databases }),
  setSelectedDatabase: (database) => set({ selectedDatabase: database }),
  setTableData: (data) => set({ 
    tableData: data, 
    originalData: JSON.parse(JSON.stringify(data)) // Deep copy
  }),
  setEditMode: (isEdit) => set({ isEditMode: isEdit }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  updateCell: (rowIndex, field, value) => {
    const { tableData } = get();
    const newData = [...tableData];
    if (newData[rowIndex]) {
      newData[rowIndex] = { ...newData[rowIndex], [field]: value };
      set({ tableData: newData });
    }
  },
  
  addRow: () => {
    const { tableData } = get();
    if (tableData.length > 0) {
      // Create a new row with the same structure as existing rows
      const firstRow = tableData[0];
      const newRow: DatabaseRow = {};
      Object.keys(firstRow).forEach(key => {
        newRow[key] = '';
      });
      set({ tableData: [...tableData, newRow] });
    }
  },
  
  deleteRow: (rowIndex) => {
    const { tableData } = get();
    const newData = tableData.filter((_, index) => index !== rowIndex);
    set({ tableData: newData });
  },
  
  resetToOriginal: () => {
    const { originalData } = get();
    set({ 
      tableData: JSON.parse(JSON.stringify(originalData)),
      isEditMode: false 
    });
  },
  
  // Chat actions
  setChatOpen: (isOpen) => set({ isChatOpen: isOpen }),
  addChatMessage: (text, isUser) => {
    const { chatMessages } = get();
    const newMessage = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
    };
    set({ chatMessages: [...chatMessages, newMessage] });
  },
  setChatLoading: (isLoading) => set({ isChatLoading: isLoading }),
}));
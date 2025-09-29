import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FoodItem, DietaryTag, LineSide, CartItem } from '@/context/FoodContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { showSuccess, showError } from '@/utils/toast';
import { PlusCircle, Edit, Trash2, Download, ChevronUp, ChevronDown, Eraser, RefreshCcw } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface Transaction {
  id: string;
  user_id: string | null;
  total_amount: number;
  item_count: number;
  items_purchased: CartItem[];
  created_at: string;
}

const AdminDashboard = () => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]); // Stores all fetched transactions

  // Dedicated states for the main counters
  const [totalItemsProcessed, setTotalItemsProcessed] = useState<number>(0);
  const [totalRevenueProcessed, setTotalRevenueProcessed] = useState<number>(0);
  const [uniqueUsers, setUniqueUsers] = useState<number>(0);

  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [newItem, setNewItem] = useState<Omit<FoodItem, 'id' | 'created_at' | 'updated_at' | 'lineSide'>>({
    name: '',
    price: 0,
    description: '',
    image: '',
    dietaryTags: [],
    origin: '',
  });

  const [hourlySales, setHourlySales] = useState<Record<string, number>>({});
  const [itemSales, setItemSales] = useState<Record<string, { quantity: number; revenue: number }>>({});
  const [averageTransactionValue, setAverageTransactionValue] = useState<number>(0);
  const [mostPopularItems, setMostPopularItems] = useState<Array<{ name: string; quantity: number; revenue: number }>>([]);
  const [leastPopularItems, setLeastPopularItems] = useState<Array<{ name: string; quantity: number; revenue: number }>>([]);

  const location = useLocation();

  // Function to fetch food items
  const fetchFoodItems = useCallback(async () => {
    console.log("AdminDashboard: Fetching food items...");
    const { data, error } = await supabase.from('food_items').select('*').order('created_at', { ascending: true });
    if (error) {
      showError('Error fetching food items: ' + error.message);
      console.error('AdminDashboard: Error fetching food items:', error);
    } else {
      const mappedData: FoodItem[] = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        description: item.description,
        image: item.image,
        dietaryTags: item.dietary_tags || [],
        lineSide: item.line_side,
        created_at: item.created_at,
        updated_at: item.updated_at,
        origin: item.origin,
      }));
      setFoodItems(mappedData);
      console.log("AdminDashboard: Food items fetched:", mappedData.length);
    }
  }, []);

  // Function to process fetched transaction data and update all stats
  const processTransactionData = useCallback((fetchedTransactions: Transaction[]) => {
    console.log("AdminDashboard: Processing transaction data for", fetchedTransactions.length, "transactions.");
    
    // Calculate and set main counters directly
    const calculatedTotalItems = fetchedTransactions.reduce((sum, t) => sum + t.item_count, 0);
    const calculatedTotalRevenue = fetchedTransactions.reduce((sum, t) => sum + t.total_amount, 0);
    // Filter out null user_ids for unique user count if anonymous checkouts are allowed
    const calculatedUniqueUsers = new Set(fetchedTransactions.map(t => t.user_id).filter(id => id !== null)).size;

    setTotalItemsProcessed(calculatedTotalItems);
    setTotalRevenueProcessed(calculatedTotalRevenue);
    setUniqueUsers(calculatedUniqueUsers);

    console.log(`AdminDashboard: Counters updated - Items: ${calculatedTotalItems}, Revenue: ${calculatedTotalRevenue.toFixed(2)}, Users: ${calculatedUniqueUsers}`);

    // Continue with other stats calculations
    const newHourlySales: Record<string, number> = {};
    const newItemSales: Record<string, { quantity: number; revenue: number }> = {};
    let totalRevenueForOtherStats = 0; 

    fetchedTransactions.forEach(t => {
      const transactionDate = new Date(t.created_at);
      const hour = transactionDate.getHours().toString().padStart(2, '0');

      newHourlySales[hour] = (newHourlySales[hour] || 0) + t.total_amount;

      if (t.items_purchased && Array.isArray(t.items_purchased)) {
        t.items_purchased.forEach((item: CartItem) => {
          if (!newItemSales[item.name]) {
            newItemSales[item.name] = { quantity: 0, revenue: 0 };
          }
          newItemSales[item.name].quantity += item.quantity;
          newItemSales[item.name].revenue += item.price * item.quantity;
        });
      }
      totalRevenueForOtherStats += t.total_amount;
    });

    const avgTxValue = fetchedTransactions.length > 0 ? totalRevenueForOtherStats / fetchedTransactions.length : 0;

    const itemSalesArray = Object.entries(newItemSales).map(([name, data]) => ({
      name,
      quantity: data.quantity,
      revenue: data.revenue,
    }));
    const sortedByQuantity = [...itemSalesArray].sort((a, b) => b.quantity - a.quantity);

    setHourlySales(newHourlySales);
    setItemSales(newItemSales);
    setAverageTransactionValue(avgTxValue);
    setMostPopularItems(sortedByQuantity.slice(0, 5));
    setLeastPopularItems(sortedByQuantity.slice(-5).reverse());
  }, []);

  // Function to fetch transactions and then process them
  const fetchTransactions = useCallback(async () => {
    console.log("AdminDashboard: Fetching transactions...");
    const { data, error } = await supabase.from('transactions').select('*');
    if (error) {
      showError('Error fetching transactions: ' + error.message);
      console.error('AdminDashboard: Error fetching transactions:', error);
    } else {
      console.log("AdminDashboard: Transactions fetched successfully:", data.length, "transactions.");
      setTransactions(data as Transaction[]); // Update the transactions state for detailed view/CSV
      processTransactionData(data as Transaction[]); // Process and update all counters
    }
  }, [processTransactionData]);

  // Orchestrator function to fetch all necessary data
  const fetchData = useCallback(async () => {
    console.log("AdminDashboard: Calling fetchData...");
    await fetchFoodItems();
    await fetchTransactions();
  }, [fetchFoodItems, fetchTransactions]);

  // Effect hook to fetch data on component mount and navigation changes
  useEffect(() => {
    console.log("AdminDashboard: useEffect triggered by location change or initial mount.");
    fetchData();
  }, [location.pathname, fetchData]); // Re-fetch when location changes (e.g., navigating back to dashboard)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (editingItem) {
      setEditingItem({ ...editingItem, [name]: name === 'price' ? parseFloat(value) : value });
    } else {
      setNewItem({ ...newItem, [name]: name === 'price' ? parseFloat(value) : value });
    }
  };

  const handleDietaryTagChange = (tag: DietaryTag, checked: boolean) => {
    if (editingItem) {
      const updatedTags = checked
        ? [...editingItem.dietaryTags, tag]
        : editingItem.dietaryTags.filter((t) => t !== tag);
      setEditingItem({ ...editingItem, dietaryTags: updatedTags });
    } else {
      const updatedTags = checked
        ? [...newItem.dietaryTags, tag]
        : newItem.dietaryTags.filter((t) => t !== tag);
      setNewItem({ ...newItem, dietaryTags: updatedTags });
    }
  };

  const handleAddOrUpdateItem = async () => {
    const itemToValidate = editingItem || newItem;

    if (!itemToValidate.name.trim()) {
      showError('Food item name cannot be empty.');
      return;
    }
    if (itemToValidate.price <= 0) {
      showError('Price must be a positive number.');
      return;
    }
    if (!itemToValidate.description.trim()) {
      showError('Description cannot be empty.');
      return;
    }
    if (!itemToValidate.origin?.trim()) {
      showError('Country/Area of Origin cannot be empty.');
      return;
    }

    if (editingItem) {
      const { error } = await supabase.from('food_items').update({
        name: editingItem.name,
        price: editingItem.price,
        description: editingItem.description,
        image: editingItem.image,
        dietary_tags: editingItem.dietaryTags,
        origin: editingItem.origin,
      }).eq('id', editingItem.id);
      if (error) {
        showError('Error updating food item: ' + error.message);
      } else {
        showSuccess('Food item updated successfully!');
        setEditingItem(null);
        fetchFoodItems();
      }
    } else {
      const baseItem = {
        name: newItem.name,
        price: newItem.price,
        description: newItem.description,
        image: newItem.image,
        dietary_tags: newItem.dietaryTags,
        origin: newItem.origin,
      };

      const { error: errorLeft } = await supabase.from('food_items').insert({ ...baseItem, line_side: 'Left' });
      const { error: errorRight } = await supabase.from('food_items').insert({ ...baseItem, line_side: 'Right' });

      if (errorLeft || errorRight) {
        showError('Error adding food item to both lines: ' + (errorLeft?.message || errorRight?.message));
      } else {
        showSuccess('Food item added to both lines successfully!');
        setNewItem({
          name: '',
          price: 0,
          description: '',
          image: '',
          dietaryTags: [],
          origin: '',
        });
        fetchFoodItems();
      }
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      const { error } = await supabase.from('food_items').delete().eq('id', id);
      if (error) {
        showError('Error deleting food item: ' + error.message);
      } else {
        showSuccess('Food item deleted successfully!');
        fetchFoodItems();
      }
    }
  };

  const handleReorder = async (id: string, direction: 'up' | 'down', currentLineSide: LineSide) => {
    const itemsInCurrentLine = foodItems.filter(item => item.lineSide === currentLineSide).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const itemIndex = itemsInCurrentLine.findIndex(item => item.id === id);
    if (itemIndex === -1) return;

    const itemToMove = itemsInCurrentLine[itemIndex];

    if (direction === 'up' && itemIndex > 0) {
      const prevItem = itemsInCurrentLine[itemIndex - 1];
      const { error: error1 } = await supabase.from('food_items').update({ created_at: prevItem.created_at }).eq('id', itemToMove.id);
      const { error: error2 } = await supabase.from('food_items').update({ created_at: itemToMove.created_at }).eq('id', prevItem.id);
      if (error1 || error2) {
        showError('Error reordering item.');
      } else {
        fetchFoodItems();
      }
    } else if (direction === 'down' && itemIndex < itemsInCurrentLine.length - 1) {
      const nextItem = itemsInCurrentLine[itemIndex + 1];
      const { error: error1 } = await supabase.from('food_items').update({ created_at: nextItem.created_at }).eq('id', itemToMove.id);
      const { error: error2 } = await supabase.from('food_items').update({ created_at: itemToMove.created_at }).eq('id', nextItem.id);
      if (error1 || error2) {
        showError('Error reordering item.');
      } else {
        fetchFoodItems();
      }
    }
  };

  const handleClearAllTransactions = async () => {
    if (window.confirm('Are you sure you want to delete ALL transaction data? This action cannot be undone.')) {
      const { error } = await supabase.from('transactions').delete().not('id', 'is', null); // Delete all rows
      if (error) {
        showError('Error clearing transactions: ' + error.message);
      } else {
        showSuccess('All transaction data cleared successfully!');
        fetchTransactions(); // Re-fetch to update the dashboard
      }
    }
  };

  const exportToCSV = () => {
    const headers = ['Transaction ID', 'User ID', 'Total Amount', 'Item Count', 'Items Purchased', 'Created At'];
    const rows = transactions.map(t => [
      t.id,
      t.user_id || 'N/A',
      t.total_amount.toFixed(2),
      t.item_count,
      JSON.stringify(t.items_purchased.map(item => `${item.name} (x${item.quantity})`)),
      new Date(t.created_at).toLocaleString(),
    ]);

    let csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    csvContent += '\n\n--- Hourly Sales Summary ---\n';
    csvContent += 'Hour,Total Sales\n';
    Object.entries(hourlySales).sort(([h1], [h2]) => parseInt(h1) - parseInt(h2)).forEach(([hour, sales]) => {
      csvContent += `${hour}:00,$${sales.toFixed(2)}\n`;
    });

    csvContent += '\n\n--- Item-by-Item Sales Summary ---\n';
    csvContent += 'Item Name,Quantity Sold,Total Revenue\n';
    Object.entries(itemSales).forEach(([name, data]) => {
      csvContent += `${name},${data.quantity},$${data.revenue.toFixed(2)}\n`;
    });

    csvContent += '\n\n--- Overall Sales Summary ---\n';
    csvContent += `Average Transaction Value,$${averageTransactionValue.toFixed(2)}\n`;
    mostPopularItems.forEach(item => {
      csvContent += `  - ${item.name} (${item.quantity} sold, $${item.revenue.toFixed(2)})\n`;
    });
    csvContent += `Least Popular Items:\n`;
    leastPopularItems.forEach(item => {
      csvContent += `  - ${item.name} (${item.quantity} sold, $${item.revenue.toFixed(2)})\n`;
    });


    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'transactions_and_stats_export.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showSuccess('Transactions and detailed stats exported to CSV!');
    }
  };

  const dietaryTags: DietaryTag[] = ["Vegetarian", "Vegan", "Gluten-Free"];

  const leftLineItems = foodItems.filter(item => item.lineSide === 'Left').sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const rightLineItems = foodItems.filter(item => item.lineSide === 'Right').sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const renderFoodItemsTable = (items: FoodItem[], lineSide: LineSide) => (
    <Table className="bg-festival-white shadow-lg rounded-lg">
      <TableHeader>
        <TableRow className="bg-festival-golden-yellow/20">
          <TableHead className="text-festival-charcoal-gray">Name</TableHead>
          <TableHead className="text-festival-charcoal-gray">Price</TableHead>
          <TableHead className="text-festival-charcoal-gray">Tags</TableHead>
          <TableHead className="text-festival-charcoal-gray">Origin</TableHead>
          <TableHead className="text-right text-festival-charcoal-gray">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item, index, arr) => (
          <TableRow key={item.id} className="hover:bg-festival-cream/50">
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>${item.price.toFixed(2)}</TableCell>
            <TableCell>{item.dietaryTags.join(', ')}</TableCell>
            <TableCell>{item.origin || 'N/A'}</TableCell>
            <TableCell className="text-right flex justify-end space-x-2">
              <Button variant="ghost" size="icon" onClick={() => handleReorder(item.id, 'up', lineSide)} disabled={index === 0}>
                <ChevronUp className="h-4 w-4 text-festival-forest-green" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleReorder(item.id, 'down', lineSide)} disabled={index === arr.length - 1}>
                <ChevronDown className="h-4 w-4 text-festival-forest-green" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setEditingItem(item)}>
                <Edit className="h-4 w-4 text-festival-deep-orange" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)}>
                <Trash2 className="h-4 w-4 text-festival-dark-red" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="min-h-screen p-8 bg-festival-cream text-festival-charcoal-gray">
      <h1 className="text-4xl font-bold mb-8 text-festival-dark-red">Admin Dashboard</h1>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="bg-festival-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-festival-dark-red">Total Items Processed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-festival-deep-orange">{totalItemsProcessed}</p>
          </CardContent>
        </Card>
        <Card className="bg-festival-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-festival-dark-red">Total Revenue Processed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-festival-deep-orange">${totalRevenueProcessed.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="bg-festival-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-festival-dark-red">Unique Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-festival-deep-orange">{uniqueUsers}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <Button onClick={fetchData} className="bg-festival-forest-green hover:bg-festival-forest-green/90 text-festival-white">
          <RefreshCcw className="mr-2 h-4 w-4" /> Refresh Data
        </Button>
        <Button onClick={exportToCSV} className="bg-festival-forest-green hover:bg-festival-forest-green/90 text-festival-white">
          <Download className="mr-2 h-4 w-4" /> Export Usage Stats to CSV
        </Button>
        <Button onClick={handleClearAllTransactions} className="bg-festival-dark-red hover:bg-festival-dark-red/90 text-festival-white">
          <Eraser className="mr-2 h-4 w-4" /> Clear All Transactions
        </Button>
      </div>

      {/* Food Item Management */}
      <h2 className="text-3xl font-bold mb-6 text-festival-dark-red">Food Item Management</h2>

      {/* Add/Edit Form */}
      <Card className="mb-8 p-6 bg-festival-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-festival-deep-orange">
            {editingItem ? 'Edit Food Item' : 'Add New Food Item'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-festival-charcoal-gray">Name</Label>
              <Input
                id="name"
                name="name"
                value={editingItem?.name || newItem.name}
                onChange={handleInputChange}
                className="mt-1 bg-festival-cream border-festival-forest-green"
              />
            </div>
            <div>
              <Label htmlFor="price" className="text-festival-charcoal-gray">Price</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={editingItem?.price || newItem.price}
                onChange={handleInputChange}
                className="mt-1 bg-festival-cream border-festival-forest-green"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description" className="text-festival-charcoal-gray">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={editingItem?.description || newItem.description}
                onChange={handleInputChange}
                className="mt-1 bg-festival-cream border-festival-forest-green"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="image" className="text-festival-charcoal-gray">Image URL</Label>
              <Input
                id="image"
                name="image"
                value={editingItem?.image || newItem.image}
                onChange={handleInputChange}
                className="mt-1 bg-festival-cream border-festival-forest-green"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="origin" className="text-festival-charcoal-gray">Country/Area of Origin</Label>
              <Input
                id="origin"
                name="origin"
                value={editingItem?.origin || newItem.origin || ''}
                onChange={handleInputChange}
                className="mt-1 bg-festival-cream border-festival-forest-green"
              />
            </div>
            <div className="flex flex-col space-y-2 md:col-span-2">
              <Label className="text-festival-charcoal-gray">Dietary Tags</Label>
              <div className="flex flex-wrap gap-4">
                {dietaryTags.map((tag) => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tag-${tag}`}
                      checked={(editingItem?.dietaryTags || newItem.dietaryTags).includes(tag)}
                      onCheckedChange={(checked) => handleDietaryTagChange(tag, checked as boolean)}
                      className="border-festival-forest-green data-[state=checked]:bg-festival-forest-green data-[state=checked]:text-festival-white"
                    />
                    <Label htmlFor={`tag-${tag}`} className="text-xl font-medium text-festival-charcoal-gray cursor-pointer">
                      {tag}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Button onClick={handleAddOrUpdateItem} className="mt-6 w-full bg-festival-deep-orange hover:bg-festival-deep-orange/90 text-festival-white">
            {editingItem ? <><Edit className="mr-2 h-4 w-4" /> Update Item</> : <><PlusCircle className="mr-2 h-4 w-4" /> Add Item to Both Lines</>}
          </Button>
          {editingItem && (
            <Button variant="outline" onClick={() => setEditingItem(null)} className="mt-2 w-full border-festival-dark-red text-festival-dark-red hover:bg-festival-dark-red/10">
              Cancel Edit
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Left Line Food Items List */}
      <div className="mb-12">
        <h3 className="text-2xl font-semibold mb-4 text-festival-dark-red">Left Line Food Items</h3>
        {renderFoodItemsTable(leftLineItems, 'Left')}
      </div>

      {/* Right Line Food Items List */}
      <div>
        <h3 className="text-2xl font-semibold mb-4 text-festival-dark-red">Right Line Food Items</h3>
        {renderFoodItemsTable(rightLineItems, 'Right')}
      </div>
    </div>
  );
};

export default AdminDashboard;
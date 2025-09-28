import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FoodItem, DietaryTag, LineSide } from '@/context/FoodContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { showSuccess, showError } from '@/utils/toast';
import { PlusCircle, Edit, Trash2, Download, ChevronUp, ChevronDown } from 'lucide-react';

interface Transaction {
  id: string;
  user_id: string | null;
  total_amount: number;
  item_count: number;
  items_purchased: any; // JSONB
  created_at: string;
}

const AdminDashboard = () => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [newItem, setNewItem] = useState<Omit<FoodItem, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    price: 0,
    description: '',
    image: '',
    dietaryTags: [],
    lineSide: 'Left',
  });

  useEffect(() => {
    fetchFoodItems();
    fetchTransactions();
  }, []);

  const fetchFoodItems = async () => {
    const { data, error } = await supabase.from('food_items').select('*').order('created_at', { ascending: true });
    if (error) {
      showError('Error fetching food items: ' + error.message);
    } else {
      setFoodItems(data as FoodItem[]);
    }
  };

  const fetchTransactions = async () => {
    const { data, error } = await supabase.from('transactions').select('*');
    if (error) {
      showError('Error fetching transactions: ' + error.message);
    } else {
      setTransactions(data as Transaction[]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (editingItem) {
      setEditingItem({ ...editingItem, [name]: name === 'price' ? parseFloat(value) : value });
    } else {
      setNewItem({ ...newItem, [name]: name === 'price' ? parseFloat(value) : value });
    }
  };

  const handleSelectChange = (value: string, name: string) => {
    if (editingItem) {
      setEditingItem({ ...editingItem, [name]: value as LineSide });
    } else {
      setNewItem({ ...newItem, [name]: value as LineSide });
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
    if (editingItem) {
      const { error } = await supabase.from('food_items').update(editingItem).eq('id', editingItem.id);
      if (error) {
        showError('Error updating food item: ' + error.message);
      } else {
        showSuccess('Food item updated successfully!');
        setEditingItem(null);
        fetchFoodItems();
      }
    } else {
      const { error } = await supabase.from('food_items').insert(newItem);
      if (error) {
        showError('Error adding food item: ' + error.message);
      } else {
        showSuccess('Food item added successfully!');
        setNewItem({
          name: '',
          price: 0,
          description: '',
          image: '',
          dietaryTags: [],
          lineSide: 'Left',
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

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const itemIndex = foodItems.findIndex(item => item.id === id);
    if (itemIndex === -1) return;

    const itemToMove = foodItems[itemIndex];
    const itemsInSameLine = foodItems.filter(item => item.lineSide === itemToMove.lineSide);
    const itemInSameLineIndex = itemsInSameLine.findIndex(item => item.id === id);

    if (direction === 'up' && itemInSameLineIndex > 0) {
      const prevItem = itemsInSameLine[itemInSameLineIndex - 1];
      // Swap created_at timestamps to reorder
      const { error: error1 } = await supabase.from('food_items').update({ created_at: prevItem.created_at }).eq('id', itemToMove.id);
      const { error: error2 } = await supabase.from('food_items').update({ created_at: itemToMove.created_at }).eq('id', prevItem.id);
      if (error1 || error2) {
        showError('Error reordering item.');
      } else {
        fetchFoodItems();
      }
    } else if (direction === 'down' && itemInSameLineIndex < itemsInSameLine.length - 1) {
      const nextItem = itemsInSameLine[itemInSameLineIndex + 1];
      // Swap created_at timestamps to reorder
      const { error: error1 } = await supabase.from('food_items').update({ created_at: nextItem.created_at }).eq('id', itemToMove.id);
      const { error: error2 } = await supabase.from('food_items').update({ created_at: itemToMove.created_at }).eq('id', nextItem.id);
      if (error1 || error2) {
        showError('Error reordering item.');
      } else {
        fetchFoodItems();
      }
    }
  };

  const totalItemsProcessed = transactions.reduce((sum, t) => sum + t.item_count, 0);
  const totalDollarAmountProcessed = transactions.reduce((sum, t) => sum + t.total_amount, 0);
  const uniqueUsers = new Set(transactions.map(t => t.user_id)).size;

  const exportToCSV = () => {
    const headers = ['Transaction ID', 'User ID', 'Total Amount', 'Item Count', 'Items Purchased', 'Created At'];
    const rows = transactions.map(t => [
      t.id,
      t.user_id || 'N/A',
      t.total_amount.toFixed(2),
      t.item_count,
      JSON.stringify(t.items_purchased),
      new Date(t.created_at).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'transactions_export.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showSuccess('Transactions exported to CSV!');
    }
  };

  const dietaryTags: DietaryTag[] = ["Vegetarian", "Vegan", "Gluten-Free"];

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
            <CardTitle className="text-festival-dark-red">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-festival-deep-orange">${totalDollarAmountProcessed.toFixed(2)}</p>
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

      <Button onClick={exportToCSV} className="mb-8 bg-festival-forest-green hover:bg-festival-forest-green/90 text-festival-white">
        <Download className="mr-2 h-4 w-4" /> Export Usage Stats to CSV
      </Button>

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
            <div>
              <Label htmlFor="lineSide" className="text-festival-charcoal-gray">Line Side</Label>
              <Select
                name="lineSide"
                value={editingItem?.lineSide || newItem.lineSide}
                onValueChange={(value) => handleSelectChange(value, 'lineSide')}
              >
                <SelectTrigger className="mt-1 bg-festival-cream border-festival-forest-green">
                  <SelectValue placeholder="Select Line Side" />
                </SelectTrigger>
                <SelectContent className="bg-festival-white">
                  <SelectItem value="Left">Left</SelectItem>
                  <SelectItem value="Right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col space-y-2">
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
                    <Label htmlFor={`tag-${tag}`} className="text-festival-charcoal-gray">{tag}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Button onClick={handleAddOrUpdateItem} className="mt-6 w-full bg-festival-deep-orange hover:bg-festival-deep-orange/90 text-festival-white">
            {editingItem ? <><Edit className="mr-2 h-4 w-4" /> Update Item</> : <><PlusCircle className="mr-2 h-4 w-4" /> Add Item</>}
          </Button>
          {editingItem && (
            <Button variant="outline" onClick={() => setEditingItem(null)} className="mt-2 w-full border-festival-dark-red text-festival-dark-red hover:bg-festival-dark-red/10">
              Cancel Edit
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Food Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-2xl font-semibold mb-4 text-festival-dark-red">Left Line Items</h3>
          <Table className="bg-festival-white shadow-lg rounded-lg">
            <TableHeader>
              <TableRow className="bg-festival-golden-yellow/20">
                <TableHead className="text-festival-charcoal-gray">Name</TableHead>
                <TableHead className="text-festival-charcoal-gray">Price</TableHead>
                <TableHead className="text-festival-charcoal-gray">Tags</TableHead>
                <TableHead className="text-right text-festival-charcoal-gray">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {foodItems.filter(item => item.lineSide === 'Left').map((item, index, arr) => (
                <TableRow key={item.id} className="hover:bg-festival-cream/50">
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>${item.price.toFixed(2)}</TableCell>
                  <TableCell>{item.dietaryTags.join(', ')}</TableCell>
                  <TableCell className="text-right flex justify-end space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleReorder(item.id, 'up')} disabled={index === 0}>
                      <ChevronUp className="h-4 w-4 text-festival-forest-green" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleReorder(item.id, 'down')} disabled={index === arr.length - 1}>
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
        </div>

        <div>
          <h3 className="text-2xl font-semibold mb-4 text-festival-dark-red">Right Line Items</h3>
          <Table className="bg-festival-white shadow-lg rounded-lg">
            <TableHeader>
              <TableRow className="bg-festival-golden-yellow/20">
                <TableHead className="text-festival-charcoal-gray">Name</TableHead>
                <TableHead className="text-festival-charcoal-gray">Price</TableHead>
                <TableHead className="text-festival-charcoal-gray">Tags</TableHead>
                <TableHead className="text-right text-festival-charcoal-gray">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {foodItems.filter(item => item.lineSide === 'Right').map((item, index, arr) => (
                <TableRow key={item.id} className="hover:bg-festival-cream/50">
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>${item.price.toFixed(2)}</TableCell>
                  <TableCell>{item.dietaryTags.join(', ')}</TableCell>
                  <TableCell className="text-right flex justify-end space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleReorder(item.id, 'up')} disabled={index === 0}>
                      <ChevronUp className="h-4 w-4 text-festival-forest-green" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleReorder(item.id, 'down')} disabled={index === arr.length - 1}>
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
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
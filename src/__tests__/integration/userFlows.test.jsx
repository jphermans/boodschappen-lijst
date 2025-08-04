import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, createMockList, createMockItem } from '../utils/testUtils';

// Mock the App component with a simplified version for testing
const MockApp = ({ initialState }) => {
  const [lists, setLists] = React.useState(initialState?.lists || []);
  const [currentList, setCurrentList] = React.useState(initialState?.currentList || null);

  const addList = (name) => {
    const newList = {
      id: `list-${Date.now()}`,
      name,
      items: [],
      createdAt: new Date(),
    };
    setLists(prev => [...prev, newList]);
    return newList;
  };

  const addItem = (listId, itemName) => {
    const newItem = {
      id: `item-${Date.now()}`,
      name: itemName,
      completed: false,
      addedAt: new Date(),
    };
    
    setLists(prev => prev.map(list => 
      list.id === listId 
        ? { ...list, items: [...list.items, newItem] }
        : list
    ));
    
    return newItem;
  };

  const toggleItem = (listId, itemId) => {
    setLists(prev => prev.map(list => 
      list.id === listId 
        ? {
            ...list,
            items: list.items.map(item =>
              item.id === itemId
                ? { ...item, completed: !item.completed }
                : item
            )
          }
        : list
    ));
  };

  return (
    <div data-testid="mock-app">
      <div data-testid="lists-section">
        <h2>Shopping Lists</h2>
        <div data-testid="add-list-form">
          <input
            data-testid="list-name-input"
            placeholder="Enter list name"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                const newList = addList(e.target.value.trim());
                setCurrentList(newList);
                e.target.value = '';
              }
            }}
          />
          <button
            data-testid="add-list-button"
            onClick={() => {
              const input = screen.getByTestId('list-name-input');
              if (input.value.trim()) {
                const newList = addList(input.value.trim());
                setCurrentList(newList);
                input.value = '';
              }
            }}
          >
            Add List
          </button>
        </div>
        
        <div data-testid="lists-container">
          {lists.map(list => (
            <div key={list.id} data-testid={`list-${list.id}`}>
              <button
                onClick={() => setCurrentList(list)}
                data-testid={`select-list-${list.id}`}
              >
                {list.name} ({list.items.length} items)
              </button>
            </div>
          ))}
        </div>
      </div>

      {currentList && (
        <div data-testid="current-list-section">
          <h3 data-testid="current-list-name">{currentList.name}</h3>
          
          <div data-testid="add-item-form">
            <input
              data-testid="item-name-input"
              placeholder="Enter item name"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  addItem(currentList.id, e.target.value.trim());
                  e.target.value = '';
                }
              }}
            />
            <button
              data-testid="add-item-button"
              onClick={() => {
                const input = screen.getByTestId('item-name-input');
                if (input.value.trim()) {
                  addItem(currentList.id, input.value.trim());
                  input.value = '';
                }
              }}
            >
              Add Item
            </button>
          </div>

          <div data-testid="items-container">
            {currentList.items.map(item => (
              <div key={item.id} data-testid={`item-${item.id}`}>
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleItem(currentList.id, item.id)}
                  data-testid={`toggle-item-${item.id}`}
                />
                <span className={item.completed ? 'completed' : ''}>
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

describe('User Flow Integration Tests', () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
  });

  test('should complete full shopping list creation and management flow', async () => {
    render(<MockApp initialState={{ lists: [], currentList: null }} />);

    // Step 1: Create a new shopping list
    const listNameInput = screen.getByTestId('list-name-input');
    const addListButton = screen.getByTestId('add-list-button');

    await user.type(listNameInput, 'Weekly Groceries');
    await user.click(addListButton);

    // Verify list was created and selected
    expect(screen.getByTestId('current-list-name')).toHaveTextContent('Weekly Groceries');

    // Step 2: Add items to the list
    const itemNameInput = screen.getByTestId('item-name-input');
    const addItemButton = screen.getByTestId('add-item-button');

    // Add first item
    await user.type(itemNameInput, 'Milk');
    await user.click(addItemButton);

    // Add second item using Enter key
    await user.type(itemNameInput, 'Bread');
    await user.keyboard('{Enter}');

    // Add third item
    await user.type(itemNameInput, 'Eggs');
    await user.click(addItemButton);

    // Verify items were added
    expect(screen.getByText('Milk')).toBeInTheDocument();
    expect(screen.getByText('Bread')).toBeInTheDocument();
    expect(screen.getByText('Eggs')).toBeInTheDocument();

    // Step 3: Mark items as completed
    const milkCheckbox = screen.getByTestId('toggle-item-item-1');
    await user.click(milkCheckbox);

    // Verify item is marked as completed
    expect(milkCheckbox).toBeChecked();

    // Step 4: Create another list
    await user.type(listNameInput, 'Party Supplies');
    await user.keyboard('{Enter}');

    // Verify new list is created and selected
    expect(screen.getByTestId('current-list-name')).toHaveTextContent('Party Supplies');

    // Step 5: Switch back to first list
    const firstListButton = screen.getByText(/Weekly Groceries/);
    await user.click(firstListButton);

    // Verify we're back to the first list and items are still there
    expect(screen.getByTestId('current-list-name')).toHaveTextContent('Weekly Groceries');
    expect(screen.getByText('Milk')).toBeInTheDocument();
    expect(screen.getByText('Bread')).toBeInTheDocument();
    expect(screen.getByText('Eggs')).toBeInTheDocument();
  });

  test('should handle empty input validation', async () => {
    render(<MockApp initialState={{ lists: [], currentList: null }} />);

    const listNameInput = screen.getByTestId('list-name-input');
    const addListButton = screen.getByTestId('add-list-button');

    // Try to add empty list name
    await user.click(addListButton);

    // Should not create a list
    expect(screen.queryByTestId('current-list-section')).not.toBeInTheDocument();

    // Try with whitespace only
    await user.type(listNameInput, '   ');
    await user.click(addListButton);

    // Should still not create a list
    expect(screen.queryByTestId('current-list-section')).not.toBeInTheDocument();
  });

  test('should handle multiple list management', async () => {
    const initialState = {
      lists: [
        createMockList({ id: 'list-1', name: 'Groceries', items: [createMockItem({ name: 'Milk' })] }),
        createMockList({ id: 'list-2', name: 'Hardware', items: [] }),
      ],
      currentList: null,
    };

    render(<MockApp initialState={initialState} />);

    // Verify both lists are displayed
    expect(screen.getByText(/Groceries/)).toBeInTheDocument();
    expect(screen.getByText(/Hardware/)).toBeInTheDocument();

    // Select first list
    const groceriesButton = screen.getByTestId('select-list-list-1');
    await user.click(groceriesButton);

    // Verify list is selected and has existing item
    expect(screen.getByTestId('current-list-name')).toHaveTextContent('Groceries');
    expect(screen.getByText('Milk')).toBeInTheDocument();

    // Switch to second list
    const hardwareButton = screen.getByTestId('select-list-list-2');
    await user.click(hardwareButton);

    // Verify second list is selected and empty
    expect(screen.getByTestId('current-list-name')).toHaveTextContent('Hardware');
    expect(screen.queryByText('Milk')).not.toBeInTheDocument();

    // Add item to second list
    const itemInput = screen.getByTestId('item-name-input');
    await user.type(itemInput, 'Screwdriver');
    await user.keyboard('{Enter}');

    // Verify item was added to correct list
    expect(screen.getByText('Screwdriver')).toBeInTheDocument();

    // Switch back to first list and verify items are separate
    await user.click(groceriesButton);
    expect(screen.getByText('Milk')).toBeInTheDocument();
    expect(screen.queryByText('Screwdriver')).not.toBeInTheDocument();
  });

  test('should handle item completion workflow', async () => {
    const initialList = createMockList({
      id: 'test-list',
      name: 'Test List',
      items: [
        createMockItem({ id: 'item-1', name: 'Item 1', completed: false }),
        createMockItem({ id: 'item-2', name: 'Item 2', completed: false }),
        createMockItem({ id: 'item-3', name: 'Item 3', completed: true }),
      ],
    });

    render(<MockApp initialState={{ lists: [initialList], currentList: initialList }} />);

    // Verify initial state
    const item1Checkbox = screen.getByTestId('toggle-item-item-1');
    const item2Checkbox = screen.getByTestId('toggle-item-item-2');
    const item3Checkbox = screen.getByTestId('toggle-item-item-3');

    expect(item1Checkbox).not.toBeChecked();
    expect(item2Checkbox).not.toBeChecked();
    expect(item3Checkbox).toBeChecked();

    // Complete first item
    await user.click(item1Checkbox);
    expect(item1Checkbox).toBeChecked();

    // Uncomplete third item
    await user.click(item3Checkbox);
    expect(item3Checkbox).not.toBeChecked();

    // Complete second item
    await user.click(item2Checkbox);
    expect(item2Checkbox).toBeChecked();
  });
});
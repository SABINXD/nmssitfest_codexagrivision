import React, { useState } from 'react';    
import { Calendar, Plus, CheckCircle, Trash2 } from 'lucide-react';

const TasksTab = ({ isDark, tasks, onAddTask, onToggle, onDelete }) => {
  const [newTaskInput, setNewTaskInput] = useState('');

  const handleAdd = () => {
    if (newTaskInput.trim()) {
      onAddTask(newTaskInput);
      setNewTaskInput('');
    }
  };

  return (
    <div className={`rounded-xl shadow-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <h2 className="text-xl font-bold mb-6 flex items-center"><Calendar className="w-6 h-6 mr-2 text-blue-500"/> Farm Tasks</h2>
      
      <div className="flex gap-2 mb-6">
        <input 
          type="text" 
          value={newTaskInput}
          onChange={(e) => setNewTaskInput(e.target.value)}
          placeholder="Add a new task..."
          className={`flex-1 p-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg font-medium transition shadow-md hover:shadow-lg">
          <Plus className="w-5 h-5"/>
        </button>
      </div>

      <div className="space-y-3">
        {tasks.length === 0 && <p className="text-center opacity-50 py-8">No tasks scheduled. Relax!</p>}
        {tasks.map(task => (
          <div key={task.id} className={`flex items-center justify-between p-4 rounded-lg border ${isDark ? 'bg-gray-700/30 border-gray-700' : 'bg-gray-50 border-gray-200'} ${task.completed ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => onToggle(task.id)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-400'}`}
              >
                {task.completed && <CheckCircle className="w-4 h-4" />}
              </button>
              <span className={task.completed ? 'line-through' : ''}>{task.text}</span>
              {task.priority === 'high' && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold">High</span>}
            </div>
            <button onClick={() => onDelete(task.id)} className="text-red-400 hover:text-red-600 p-2">
              <Trash2 className="w-4 h-4"/>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
export default TasksTab;
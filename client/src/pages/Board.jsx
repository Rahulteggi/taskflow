import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import { getTasks, createTask, updateTask, deleteTask } from '../api'

const COLUMNS = [
  { id: 'todo', label: '📋 To Do', color: '#e2e8f0' },
  { id: 'in_progress', label: '🔄 In Progress', color: '#bee3f8' },
  { id: 'review', label: '👀 Review', color: '#fef3c7' },
  { id: 'done', label: '✅ Done', color: '#c6f6d5' },
]

const PRIORITIES = ['low', 'medium', 'high', 'urgent']
const PRIORITY_COLORS = { low: '#48bb78', medium: '#ed8936', high: '#e53e3e', urgent: '#805ad5' }

export default function Board() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', status: 'todo' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks()

    // Real-time socket connection
    const socket = io('http://localhost:8080')
    socket.emit('join-project', projectId)
    socket.on('task-created', (task) => setTasks((prev) => [...prev, task]))
    socket.on('task-updated', (task) => setTasks((prev) => prev.map((t) => t._id === task._id ? task : t)))
    socket.on('task-deleted', ({ _id }) => setTasks((prev) => prev.filter((t) => t._id !== _id)))

    return () => socket.disconnect()
  }, [projectId])

  const fetchTasks = async () => {
    try {
      const { data } = await getTasks(projectId)
      setTasks(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await createTask({ ...newTask, project: projectId })
      setShowModal(false)
      setNewTask({ title: '', description: '', priority: 'medium', status: 'todo' })
    } catch (err) {
      console.error(err)
    }
  }

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus })
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (taskId) => {
    if (!confirm('Delete this task?')) return
    try {
      await deleteTask(taskId)
    } catch (err) {
      console.error(err)
    }
  }

  const tasksByStatus = (status) => tasks.filter((t) => t.status === status)

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/')}>← Back</button>
        <h1 style={styles.title}>📋 Kanban Board</h1>
        <button style={styles.addBtn} onClick={() => setShowModal(true)}>+ Add Task</button>
      </div>

      {/* Board */}
      {loading ? (
        <p style={styles.loading}>Loading board...</p>
      ) : (
        <div style={styles.board}>
          {COLUMNS.map((col) => (
            <div key={col.id} style={styles.column}>
              <div style={{ ...styles.columnHeader, background: col.color }}>
                <span>{col.label}</span>
                <span style={styles.count}>{tasksByStatus(col.id).length}</span>
              </div>
              <div style={styles.taskList}>
                {tasksByStatus(col.id).map((task) => (
                  <div key={task._id} style={styles.taskCard}>
                    <div style={styles.taskTop}>
                      <p style={styles.taskTitle}>{task.title}</p>
                      <button style={styles.deleteTaskBtn} onClick={() => handleDelete(task._id)}>×</button>
                    </div>
                    {task.description && <p style={styles.taskDesc}>{task.description}</p>}
                    <div style={styles.taskBottom}>
                      <span style={{ ...styles.priority, background: PRIORITY_COLORS[task.priority] }}>
                        {task.priority}
                      </span>
                      <select style={styles.statusSelect} value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}>
                        {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.id.replace('_', ' ')}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
                {tasksByStatus(col.id).length === 0 && (
                  <p style={styles.emptyCol}>No tasks</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Task Modal */}
      {showModal && (
        <div style={styles.overlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>New Task</h2>
            <form onSubmit={handleCreate} style={styles.form}>
              <input style={styles.input} placeholder="Task title" value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} required />
              <textarea style={styles.textarea} placeholder="Description (optional)" value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} rows={3} />
              <select style={styles.input} value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <select style={styles.input} value={newTask.status}
                onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}>
                {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
              <div style={styles.modalBtns}>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" style={styles.submitBtn}>Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#f0f2f5', fontFamily: '-apple-system, sans-serif' },
  header: { background: 'white', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  backBtn: { background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 500 },
  title: { fontSize: '1.2rem', margin: 0, color: '#1a1a2e' },
  addBtn: { background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' },
  loading: { textAlign: 'center', marginTop: '60px', color: '#888' },
  board: { display: 'flex', gap: '16px', padding: '24px', overflowX: 'auto', minHeight: 'calc(100vh - 60px)' },
  column: { minWidth: '280px', maxWidth: '280px', background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', alignSelf: 'flex-start' },
  columnHeader: { padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, fontSize: '0.9rem' },
  count: { background: 'rgba(0,0,0,0.12)', borderRadius: '12px', padding: '2px 8px', fontSize: '0.8rem' },
  taskList: { padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '80px' },
  taskCard: { background: '#f9fafb', borderRadius: '8px', padding: '12px', border: '1px solid #e2e8f0' },
  taskTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' },
  taskTitle: { margin: 0, fontWeight: 600, fontSize: '0.9rem', color: '#1a1a2e', flex: 1 },
  deleteTaskBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: '1.2rem', padding: 0, lineHeight: 1 },
  taskDesc: { margin: '4px 0 8px', color: '#888', fontSize: '0.8rem', lineHeight: 1.5 },
  taskBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' },
  priority: { color: 'white', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', fontWeight: 600, textTransform: 'uppercase' },
  statusSelect: { fontSize: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '3px 6px', background: 'white', cursor: 'pointer' },
  emptyCol: { color: '#ccc', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal: { background: 'white', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '440px' },
  modalTitle: { margin: '0 0 20px', fontSize: '1.3rem', color: '#1a1a2e' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  input: { padding: '11px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' },
  textarea: { padding: '11px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.9rem', resize: 'none', fontFamily: 'inherit', outline: 'none' },
  modalBtns: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' },
  cancelBtn: { padding: '10px 20px', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', cursor: 'pointer', fontSize: '0.9rem' },
  submitBtn: { padding: '10px 20px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' },
}

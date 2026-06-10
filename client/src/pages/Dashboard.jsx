import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProjects, createProject, deleteProject } from '../api'
import { useAuth } from '../context/AuthContext'

const COLORS = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140']

export default function Dashboard() {
  const [projects, setProjects] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [newProject, setNewProject] = useState({ name: '', description: '', color: COLORS[0] })
  const [loading, setLoading] = useState(true)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const { data } = await getProjects()
      setProjects(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const { data } = await createProject(newProject)
      setProjects([...projects, data])
      setShowModal(false)
      setNewProject({ name: '', description: '', color: COLORS[0] })
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!confirm('Delete this project?')) return
    await deleteProject(id)
    setProjects(projects.filter((p) => p._id !== id))
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.logo}>📋 TaskFlow</h1>
        <div style={styles.headerRight}>
          <span style={styles.userName}>👋 {user?.name}</span>
          <button style={styles.logoutBtn} onClick={logout}>Logout</button>
        </div>
      </div>

      {/* Main */}
      <div style={styles.main}>
        <div style={styles.titleRow}>
          <h2 style={styles.pageTitle}>My Projects</h2>
          <button style={styles.createBtn} onClick={() => setShowModal(true)}>+ New Project</button>
        </div>

        {loading ? (
          <p style={styles.empty}>Loading...</p>
        ) : projects.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyIcon}>🗂️</p>
            <p>No projects yet. Create your first one!</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {projects.map((p) => (
              <div key={p._id} style={{ ...styles.projectCard, borderTop: `4px solid ${p.color}` }}
                onClick={() => navigate(`/board/${p._id}`)}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.projectName}>{p.name}</h3>
                  <button style={styles.deleteBtn} onClick={(e) => handleDelete(p._id, e)}>🗑️</button>
                </div>
                <p style={styles.projectDesc}>{p.description || 'No description'}</p>
                <p style={styles.projectMeta}>{p.members?.length || 1} member(s)</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div style={styles.overlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>New Project</h2>
            <form onSubmit={handleCreate} style={styles.form}>
              <input style={styles.input} placeholder="Project name" value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} required />
              <textarea style={styles.textarea} placeholder="Description (optional)" value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} rows={3} />
              <div>
                <p style={styles.colorLabel}>Color</p>
                <div style={styles.colorRow}>
                  {COLORS.map((c) => (
                    <div key={c} onClick={() => setNewProject({ ...newProject, color: c })}
                      style={{ ...styles.colorDot, background: c, border: newProject.color === c ? '3px solid #1a1a2e' : '3px solid transparent' }} />
                  ))}
                </div>
              </div>
              <div style={styles.modalBtns}>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" style={styles.submitBtn}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#f7f8fc', fontFamily: '-apple-system, sans-serif' },
  header: { background: 'white', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  logo: { fontSize: '1.3rem', margin: 0, color: '#1a1a2e' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  userName: { color: '#555', fontSize: '0.9rem' },
  logoutBtn: { background: 'none', border: '1px solid #e2e8f0', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', color: '#555', fontSize: '0.85rem' },
  main: { maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' },
  titleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  pageTitle: { fontSize: '1.5rem', margin: 0, color: '#1a1a2e' },
  createBtn: { background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  projectCard: { background: 'white', borderRadius: '12px', padding: '20px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'transform 0.2s' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' },
  projectName: { fontSize: '1.05rem', margin: 0, color: '#1a1a2e', fontWeight: 600 },
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: 0 },
  projectDesc: { color: '#888', fontSize: '0.85rem', margin: '0 0 12px', lineHeight: 1.5 },
  projectMeta: { color: '#aaa', fontSize: '0.8rem', margin: 0 },
  empty: { color: '#888', textAlign: 'center', marginTop: '60px' },
  emptyState: { textAlign: 'center', marginTop: '80px', color: '#888' },
  emptyIcon: { fontSize: '3rem', margin: '0 0 8px' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal: { background: 'white', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '440px' },
  modalTitle: { margin: '0 0 20px', fontSize: '1.3rem', color: '#1a1a2e' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  input: { padding: '11px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit' },
  textarea: { padding: '11px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.9rem', resize: 'none', fontFamily: 'inherit' },
  colorLabel: { fontSize: '0.85rem', fontWeight: 600, color: '#555', margin: '0 0 8px' },
  colorRow: { display: 'flex', gap: '10px' },
  colorDot: { width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer' },
  modalBtns: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' },
  cancelBtn: { padding: '10px 20px', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', cursor: 'pointer', fontSize: '0.9rem' },
  submitBtn: { padding: '10px 20px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' },
}

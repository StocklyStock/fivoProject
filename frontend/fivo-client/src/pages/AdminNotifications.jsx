import { useEffect, useState } from 'react';
import {
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const AdminNotifications = () => {
  const [notiTitle, setNotiTitle] = useState('');
  const [notiMessage, setNotiMessage] = useState('');
  const [notiType, setNotiType] = useState('notice');
  const [notifications, setNotifications] = useState([]);
  const [editTarget, setEditTarget] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editMessage, setEditMessage] = useState('');

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.get('/api/accounts/admin/notifications/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
    } catch (err) {
      console.error('🔔 알림 조회 실패', err);
    }
  };

  const handleCreateNotification = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(
        '/api/accounts/admin/notifications/',
        {
          title: notiTitle,
          message: notiMessage,
          type: notiType,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotiTitle('');
      setNotiMessage('');
      setNotiType('notice');
      fetchNotifications();
    } catch (err) {
      console.error('❌ 알림 등록 실패', err);
    }
  };

  const handleEdit = (noti) => {
    setEditTarget(noti);
    setEditTitle(noti.title);
    setEditMessage(noti.message);
  };
  
  const handleEditSubmit = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.patch(
        `/api/accounts/admin/notifications/${editTarget.id}/update/`,
        { title: editTitle, message: editMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditTarget(null);
      fetchNotifications();
    } catch (err) {
      console.error('✏️ 수정 실패:', err);
    }
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('이 알림을 삭제할까요?')) return;
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`/api/accounts/admin/notifications/${id}/delete/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (err) {
      console.error('🗑 삭제 실패:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <Box className="p-6">
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        🔔 관리자 기능: 알림 설정
      </Typography>
      <Typography variant="body2" mb={3}>
        공지사항, 이벤트 알림 등을 전체 사용자에게 발송하고 관리할 수 있는 기능입니다.
      </Typography>

      {/* 알림 작성 폼 */}
      <Box component="form" onSubmit={handleCreateNotification} sx={{ mb: 4 }}>
        <TextField
          label="제목"
          variant="outlined"
          fullWidth
          margin="normal"
          value={notiTitle}
          onChange={(e) => setNotiTitle(e.target.value)}
          required
        />
        <TextField
          label="내용"
          variant="outlined"
          fullWidth
          multiline
          rows={4}
          margin="normal"
          value={notiMessage}
          onChange={(e) => setNotiMessage(e.target.value)}
          required
        />
        <TextField
          label="알림 종류"
          select
          fullWidth
          margin="normal"
          value={notiType}
          onChange={(e) => setNotiType(e.target.value)}
          SelectProps={{ native: true }}
        >
          <option value="notice">공지</option>
          <option value="event">이벤트</option>
        </TextField>
        <Button type="submit" variant="contained" color="primary">
          알림 등록
        </Button>
      </Box>

      {/* 알림 리스트 */}
      <Typography variant="h6" gutterBottom>📋 등록된 알림</Typography>
      <Paper elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>종류</TableCell>
              <TableCell>제목</TableCell>
              <TableCell>내용</TableCell>
              <TableCell>작성일</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <TableRow key={n.id}>
                  <TableCell>{n.type === "notice" ? "공지" : "이벤트"}</TableCell>
                  <TableCell>{n.title}</TableCell>
                  <TableCell>{n.message}</TableCell>
                  <TableCell>{new Date(n.created_at).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => handleEdit(n)}>
                      <EditIcon fontSize="small" />
                    </Button>
                    <Button size="small" color="error" onClick={() => handleDelete(n.id)}>
                      <DeleteIcon fontSize="small" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">등록된 알림이 없습니다.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
      <Dialog open={!!editTarget} onClose={() => setEditTarget(null)}>
        <DialogTitle>🔁 알림 수정</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="제목"
            fullWidth
            margin="normal"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
          <TextField
            label="내용"
            fullWidth
            multiline
            rows={4}
            margin="normal"
            value={editMessage}
            onChange={(e) => setEditMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTarget(null)}>취소</Button>
          <Button onClick={handleEditSubmit} variant="contained" color="primary">
            저장
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminNotifications;

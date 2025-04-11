// 📄 src/pages/AdminUsers.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Typography,
  TextField,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box
} from '@mui/material';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      try {
        const response = await axios.get('/api/accounts/all/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUsers(response.data);
        setFilteredUsers(response.data);
      } catch (err) {
        console.error('유저 목록 조회 실패:', err);
        if (err.response?.status === 401) {
          alert('관리자 권한이 없습니다. 관리자 계정으로 로그인해주세요.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter((user) =>
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.nickname.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [search, users]);

  return (
    <Box mt={4}>
      <Typography variant="h6" gutterBottom>
        👥 관리자 기능: 사용자 목록
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        회원 정보를 검색, 조회하고 관리자 권한으로 유저를 수정/삭제할 수 있는 기능입니다.
      </Typography>

      <TextField
        label="사용자 검색"
        variant="outlined"
        fullWidth
        margin="normal"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <Box className="flex justify-center mt-10">
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} className="rounded-xl shadow-md">
          <Table>
            <TableHead className="bg-gray-100">
              <TableRow>
                <TableCell>이메일</TableCell>
                <TableCell>닉네임</TableCell>
                <TableCell>전화번호</TableCell>
                <TableCell align="center">인증 여부</TableCell>
                <TableCell align="center">관리자 여부</TableCell>
                <TableCell align="center">가입일</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => setSelectedUser(user)}
                  >
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.nickname}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={user.is_verified ? '인증 완료' : '미인증'}
                        color={user.is_verified ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={user.is_staff ? '관리자' : '일반'}
                        color={user.is_staff ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {new Date(user.date_joined).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    유저가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={!!selectedUser} onClose={() => setSelectedUser(null)}>
        <DialogTitle>사용자 상세 정보</DialogTitle>
        <DialogContent dividers>
          {selectedUser && (
            <Box>
              <Typography>Email: {selectedUser.email}</Typography>
              <Typography>닉네임: {selectedUser.nickname}</Typography>
              <Typography>전화번호: {selectedUser.phone}</Typography>
              <Typography>인증 여부: {selectedUser.is_verified ? '✅' : '❌'}</Typography>
              <Typography>관리자 여부: {selectedUser.is_staff ? '✅' : '❌'}</Typography>
              <Typography>가입일: {new Date(selectedUser.date_joined).toLocaleString()}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedUser(null)}>닫기</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUsers;

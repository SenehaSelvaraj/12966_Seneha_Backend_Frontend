import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
 

const mockNavigate = vi.fn();
 
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});
 

vi.mock('./api/axiosConfig', () => ({
  userApi: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
  },
  itemApi: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
  },
}));
 

import { userApi, itemApi } from './api/axiosConfig';
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';
import MyReports from './pages/MyReports';
import SearchingItems from './pages/SearchingItems';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import AdminUsers from './pages/admin/AdminUsers';
 

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });
 
  test('renders inputs and button', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(screen.getByPlaceholderText(/enter username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter password/i)).toBeInTheDocument();
  });
 
  test('wrong credentials shows error', async () => {
    userApi.post.mockRejectedValue({
      response: { data: { error: 'Incorrect password' } }
    });
 
    render(<MemoryRouter><Login /></MemoryRouter>);
 
    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'wrongpwd' }
    });
 
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
 
    await waitFor(() =>
      expect(screen.getByText('Incorrect password')).toBeInTheDocument()
    );
  });
 
  test('USER redirects to dashboard', async () => {
    userApi.post.mockResolvedValue({
      data: { userId: 1, role: 'USER', temporaryPassword: false }
    });
 
    render(<MemoryRouter><Login /></MemoryRouter>);
 
    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'Test@123' }
    });
 
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
 
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    );
  });
});
 

describe('ChangePassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('userId', '4');
  });
 
 test('password mismatch error', async () => {
  render(<MemoryRouter><ChangePassword /></MemoryRouter>);
 
  const inputs = screen.getAllByPlaceholderText(/new password/i);
 
  fireEvent.change(inputs[0], { target: { value: 'NewPass123' } });
  fireEvent.change(inputs[1], { target: { value: 'Different123' } });
 
  fireEvent.click(screen.getByRole('button'));
 
  await waitFor(() =>
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
  );
});
 
 
test('successful password change', async () => {
  userApi.put.mockResolvedValue({
    data: { message: 'success' }
  });
 
  render(<MemoryRouter><ChangePassword /></MemoryRouter>);
 
  const inputs = screen.getAllByPlaceholderText(/new password/i);
 
  fireEvent.change(inputs[0], { target: { value: 'NewPass@123' } });
  fireEvent.change(inputs[1], { target: { value: 'NewPass@123' } });
 
  fireEvent.click(screen.getByRole('button'));
 
  await waitFor(() =>
    expect(screen.getByText(/password/i)).toBeInTheDocument()
  );
});
});
 

describe('MyReports', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('userId', '3');
  });
 
  test('shows reports', async () => {
    itemApi.get.mockResolvedValue({
      data: [{ id: 1, itemName: 'Wallet', status: 'LOST' }]
    });
 
    render(<MemoryRouter><MyReports /></MemoryRouter>);
 
    await waitFor(() =>
      expect(screen.getByText('Wallet')).toBeInTheDocument()
    );
  });
});
 

describe('SearchingItems', () => {
  test('renders items', async () => {
    itemApi.get.mockResolvedValue({
      data: [{ id: 1, itemName: 'Keys' }]
    });
 
    render(<MemoryRouter><SearchingItems /></MemoryRouter>);
 
    await waitFor(() =>
      expect(screen.getByText('Keys')).toBeInTheDocument()
    );
  });
});
 

describe('Navbar', () => {
test('USER links visible', () => {
  localStorage.setItem('userId', '1');
  localStorage.setItem('role', 'USER');
 
  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Navbar />
    </MemoryRouter>
  );
 
  expect(screen.getByText(/my reports/i)).toBeInTheDocument();
});
 
});
 

describe('PrivateRoute', () => {
  test('blocks unauthenticated user', () => {
    localStorage.clear();
 
    render(
      <MemoryRouter>
        <PrivateRoute><div>Protected</div></PrivateRoute>
      </MemoryRouter>
    );
 
    expect(screen.queryByText('Protected')).not.toBeInTheDocument();
  });
});
 

describe('AdminUsers', () => {
  beforeEach(() => {
    localStorage.setItem('userId', '1');
    localStorage.setItem('role', 'ADMIN');
  });
 
  test('renders users', async () => {
    userApi.get.mockResolvedValue({
      data: [{ id: 1, username: 'admin' }]
    });
 
    render(<MemoryRouter><AdminUsers /></MemoryRouter>);
 
    await waitFor(() =>
      expect(screen.getByText('admin')).toBeInTheDocument()
    );
  });
});
 
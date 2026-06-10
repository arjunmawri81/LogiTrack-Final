import SuperAdminLayout from "./SuperAdminLayout";

const UserManagement = () => {
  const users = [
    {
      name: "Arjun",
      email: "arjun@test.com",
      role: "MERCHANT",
    },
  ];

  return (
    <SuperAdminLayout>
      <h1>User Management 👥</h1>

      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user, index) => (
            <tr key={index}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </SuperAdminLayout>
  );
};

export default UserManagement;
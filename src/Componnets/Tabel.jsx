import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import axios from 'axios';
import Button from 'react-bootstrap/Button';

function Tabel() {
    const [data, setData] = useState([]);
    const [currentPageNumber, setCurrentPageNumber] = useState(1);
    const [ dataPerpage] = useState(10);
    const [searchText, setSearchText] = useState('');
    const [editableMemberId, setEditableMemberId] = useState(null);
    const [selectedRowsData, setSelectedRowsData] = useState([]);
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await axios.get('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json');
          setData(response.data);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
  
      fetchData();
    }, []);
  
    const filteredMembersData =data.filter(
      (member) =>
        member.name.toLowerCase().includes(searchText.toLowerCase()) ||
        member.email.toLowerCase().includes(searchText.toLowerCase()) ||
        member.role.toLowerCase().includes(searchText.toLowerCase())
    );
  
    const lastItemIndex = currentPageNumber * dataPerpage;
    const firstItemIndex = lastItemIndex - dataPerpage;
    const currentMembersData = filteredMembersData.slice(firstItemIndex, lastItemIndex);
  
    const handlePageChange = (pageNumber) => setCurrentPageNumber(pageNumber);
  
    const handleSearchInputChange = (event) => setSearchText(event.target.value);
  
    const handleEditButtonClick = (memberId) => setEditableMemberId(memberId);
  
    const handleSaveButtonClick = () => setEditableMemberId(null);
  
    const handleDeleteButtonClick = (memberId) => {
      const updatedMembersData =data.filter((member) => member.id !== memberId);
      setData(updatedMembersData);
    };
  
    const handleCheckboxChange = (memberId) => {
      const isSelected = selectedRowsData.includes(memberId);
  
      if (isSelected) {
        setSelectedRowsData(selectedRowsData.filter((id) => id !== memberId));
      } else {
        setSelectedRowsData([...selectedRowsData, memberId]);
      }
    };
  
    const handleSelectAllCheckboxChange = () => {
      const allOnPageSelected = currentMembersData.every((member) => selectedRowsData.includes(member.id));
  
      if (allOnPageSelected) {
        setSelectedRowsData([]);
      } else {
        setSelectedRowsData(currentMembersData.map((member) => member.id));
      }
    };
  
    const handleDeleteSelectedButtonClick = () => {
      const updatedMembersData =data.filter((member) => !selectedRowsData.includes(member.id));
      setData(updatedMembersData);
      setSelectedRowsData([]);
    };
  
    const pageNumbers = Array.from({ length: Math.ceil(filteredMembersData.length / dataPerpage) }, (_, index) => index + 1);
  
    return (
      <div>
        <h1>Admin Dashboard</h1>
  
        <input className='Search-bar' type="text" placeholder="Search..." value={searchText} onChange={handleSearchInputChange} />
  
        <Table>
          <thead>
            <tr>
              <th>
                <input 
                  type="checkbox"
                  onChange={handleSelectAllCheckboxChange}
                  checked={selectedRowsData.length === currentMembersData.length}
                />
              </th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentMembersData.map((member) => (
              <tr key={member.id} style={{ background: selectedRowsData.includes(member.id) ? '#ccc' : 'transparent' }}>
                <td>
                  <input
                    type="checkbox"
                    onChange={() => handleCheckboxChange(member.id)}
                    checked={selectedRowsData.includes(member.id)}
                  />
                </td>
                <td>{editableMemberId === member.id ? <input type="text" value={member.name} /> : member.name}</td>
                <td>{editableMemberId === member.id ? <input type="text" value={member.email} /> : member.email}</td>
                <td>{editableMemberId === member.id ? <input type="text" value={member.role} /> : member.role}</td>
                <td>
                  {editableMemberId === member.id ? (
                    <Button onClick={handleSaveButtonClick}>Save</Button>
                  ) : (
                    <>
                      <Button onClick={() => handleEditButtonClick(member.id)}>Edit</Button>
                      <Button onClick={() => handleDeleteButtonClick(member.id)}>Delete</Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
  
        {selectedRowsData.length > 0 && <Button onClick={handleDeleteSelectedButtonClick}>Delete Selected</Button>}
  
        <div>
          <Button variant="primary" onClick={() => handlePageChange(currentPageNumber - 1)} disabled={currentPageNumber === 1}>
            Previous
          </Button>
          {pageNumbers.map((number) => (
            <Button key={number} onClick={() => handlePageChange(number)} className={currentPageNumber === number ? 'active' : ''}>
              {number}
            </Button>
          ))}
          <Button onClick={() => handlePageChange(currentPageNumber + 1)} disabled={lastItemIndex >= filteredMembersData.length}>
            Next
          </Button>
        </div>
      </div>
    );
}

export default Tabel;

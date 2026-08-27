import React, { useState, useEffect, useRef } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import CustomTable from '../../CustomTable/CustomTable';
import apiClient from '../../../../api/apiClient';
import './Epin.css';

export const Epin = () => {
    const [loading, setLoading] = useState(false);
    const [epinData, setEpinData] = useState([]);
    const [totalEpin, setTotalEpin] = useState(0);
    const [epinType, setEpinType] = useState(1);
    const [validUsers, setValidUsers] = useState({});
    const [validUserRegnos, setValidUserRegnos] = useState({});
    const [checkingUsers, setCheckingUsers] = useState({});
    const [inputValues, setInputValues] = useState({});
    const [transferring, setTransferring] = useState({});
    const debounceTimerRef = useRef(null);

    const getColumns = () => epinType === 0 
        ? ['S. No.', 'E-Pin No.', 'E-Pin Name', 'Action']
        : ['S. No.', 'E-Pin No.', 'E-Pin Name', 'User Id', 'Name'];

    const getRegNo = () => sessionStorage.getItem('regno');

    const fetchEpinData = async () => {
        setLoading(true);
        try {
            const { data } = await apiClient.get('/Dashboard/epin-list', {
                params: { RegNo: getRegNo(), EpinType: epinType }
            });
            if (data?.success && Array.isArray(data.data)) {
                const mapped = data.data.map(item => ({
                    id: item.EpinId,
                    epinNo: item.EpinNumber,
                    epinName: item.SEName,
                    userId: item.kitCode || '',
                    memName: item.MemName || '',
                    kitPrice: item.kitPrice || 0
                }));
                setEpinData(mapped);
                setTotalEpin(mapped.length);
            } else {
                setEpinData([]);
                setTotalEpin(0);
            }
        } catch (error) {
            console.error('Error fetching EPIN data:', error);
            setEpinData([]);
            setTotalEpin(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEpinData(); }, [epinType]);

    const handleFilterChange = (e) => setEpinType(e.target.value === 'unused' ? 0 : 1);

    const validateUser = async (epinNo, loginid) => {
        if (!loginid?.trim()) {
            setValidUsers(prev => ({ ...prev, [epinNo]: false }));
            setValidUserRegnos(prev => ({ ...prev, [epinNo]: null }));
            return;
        }
        setCheckingUsers(prev => ({ ...prev, [epinNo]: true }));
        try {
            const { data } = await apiClient.get('/User/check-user', { params: { loginid: loginid.trim() } });
            if (data?.success && data.data) {
                const targetRegno = data.data.regno || data.data.RegNo;
                if (targetRegno) {
                    setValidUsers(prev => ({ ...prev, [epinNo]: true }));
                    setValidUserRegnos(prev => ({ ...prev, [epinNo]: targetRegno }));
                } else {
                    setValidUsers(prev => ({ ...prev, [epinNo]: false }));
                    setValidUserRegnos(prev => ({ ...prev, [epinNo]: null }));
                }
            } else {
                setValidUsers(prev => ({ ...prev, [epinNo]: false }));
                setValidUserRegnos(prev => ({ ...prev, [epinNo]: null }));
            }
        } catch (error) {
            console.error('User validation error:', error);
            setValidUsers(prev => ({ ...prev, [epinNo]: false }));
            setValidUserRegnos(prev => ({ ...prev, [epinNo]: null }));
        } finally {
            setCheckingUsers(prev => ({ ...prev, [epinNo]: false }));
        }
    };

    const onInputChange = (epinNo, value) => {
        setInputValues(prev => ({ ...prev, [epinNo]: value }));
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        setValidUsers(prev => ({ ...prev, [epinNo]: false }));
        setValidUserRegnos(prev => ({ ...prev, [epinNo]: null }));
        debounceTimerRef.current = setTimeout(() => validateUser(epinNo, value), 500);
    };

    const handleTransfer = async (epinNo, targetLoginId) => {
        if (transferring[epinNo]) return;
        const epin = epinData.find(e => e.epinNo === epinNo);
        if (!epin) return alert('EPIN not found');
        const targetRegno = validUserRegnos[epinNo];
        if (!validUsers[epinNo] || !targetLoginId || !targetRegno) return alert('Please enter a valid User ID');
        const loggedInRegno = parseInt(getRegNo(), 10);
        if (isNaN(loggedInRegno)) return alert('Your registration number is missing. Please login again.');
        setTransferring(prev => ({ ...prev, [epinNo]: true }));
        const payload = { regno: targetRegno, rkprice: epin.kitPrice, uregno: loggedInRegno, pkg: "BOT", ist: new Date().toISOString(), aggrement: epinNo };
        try {
            const { data } = await apiClient.post('/Dashboard/activate-with-epin', payload);
            if (data?.success) {
                alert('EPIN transferred successfully!');
                await fetchEpinData();
                setInputValues(prev => ({ ...prev, [epinNo]: '' }));
                setValidUsers(prev => ({ ...prev, [epinNo]: false }));
                setValidUserRegnos(prev => ({ ...prev, [epinNo]: null }));
            } else alert(data?.message || 'Activation failed. Please try again.');
        } catch (error) {
            console.error('Error activating EPIN:', error);
            alert(error.response?.data?.message || 'An error occurred while activating EPIN.');
        } finally {
            setTransferring(prev => ({ ...prev, [epinNo]: false }));
        }
    };

    return (
        <div className="epin-container p-4">
            <div className="d-flex justify-content-between mb-4 p-2">
                <div className="epin-header">
                    <h2 className="epin-title">List E-Pin</h2>
                    <div className="epin-stats d-flex">
                        <div className="stat-card1">
                            <span className="stat-label">Total E-Pin</span> &nbsp;&nbsp;
                            <span className="stat-value">{totalEpin}</span>
                        </div>
                    </div>
                </div>
                <select className="epin-filter" value={epinType === 0 ? 'unused' : 'used'} onChange={handleFilterChange}>
                    <option value="unused">Unused ePin</option>
                    <option value="used">Used ePin</option>
                </select>
            </div>
            <div className="epin-section">
                <CustomTable columns={getColumns()} loading={loading} emptyMessage="No E-Pin Found" loaderSize="md" loaderText="Loading E-Pins...">
                    {epinData.map((epin, index) => (
                        <tr key={epin.id} className="epin-row">
                            <td className="text-center"><div className="sr-no-circle">{index + 1}</div></td>
                            <td>{epin.epinNo}</td>
                            <td>{epin.epinName}</td>
                            {epinType === 0 ? (
                                <td className="text-center">
                                    <div className="d-flex gap-2 align-items-center justify-content-center">
                                        <div style={{ position: 'relative', display: 'inline-block' }}>
                                            <input type="text" className="form-control" placeholder="User ID / Login ID" style={{ width: '150px' }}
                                                value={inputValues[epin.epinNo] || ''}
                                                onChange={e => onInputChange(epin.epinNo, e.target.value)}
                                                disabled={transferring[epin.epinNo]} />
                                            {validUsers[epin.epinNo] && !transferring[epin.epinNo] && (
                                                <FaCheckCircle style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: '#28a745', background: 'white', borderRadius: '50%' }} />
                                            )}
                                            {checkingUsers[epin.epinNo] && (
                                                <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', border: '2px solid #ccc', borderTopColor: '#667eea', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                                            )}
                                        </div>
                                        <button className="btn btn-sm btn-primary"
                                            onClick={() => handleTransfer(epin.epinNo, inputValues[epin.epinNo])}
                                            disabled={transferring[epin.epinNo] || !validUsers[epin.epinNo] || !inputValues[epin.epinNo]}>
                                            {transferring[epin.epinNo] ? 'Processing...' : 'Submit'}
                                        </button>
                                    </div>
                                </td>
                            ) : (
                                <>
                                    <td>{epin.userId || '-'}</td>
                                    <td>{epin.memName || '-'}</td>
                                </>
                            )}
                        </tr>
                    ))}
                </CustomTable>
            </div>
            <style>{`@keyframes spin { to { transform: translateY(-50%) rotate(360deg); } }`}</style>
        </div>
    );
};
import React from 'react';
import DispatcherDashboard from '../dispatcher/Dashboard';
import { Top5TechniciansWidget } from '../../components/admin/Top5TechniciansWidget';

const AdminOverviewPage = () => {
  return (
    <div>
      <DispatcherDashboard></DispatcherDashboard>
      <div className="py-5">
        <Top5TechniciansWidget></Top5TechniciansWidget>
      </div>
    </div>
  );
};

export default AdminOverviewPage; 
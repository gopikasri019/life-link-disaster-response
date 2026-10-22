import React, { useState } from 'react';
import {
  Package,
  Plus,
  AlertTriangle,
  Building2,
  PhoneCall,
  MapPin,
  Search,
  CheckCircle2,
  TrendingDown,
  ArrowDownRight,
  ArrowUpRight,
  X,
  Edit,
} from 'lucide-react';
import { ReliefDepot } from '../../types';
import { StorageEngine } from '../../services/storage';

interface ReliefDepotInventoryProps {
  depots: ReliefDepot[];
  onInventoryChanged: () => void;
  activeDistrict: string;
}

export const ReliefDepotInventory: React.FC<ReliefDepotInventoryProps> = ({
  depots,
  onInventoryChanged,
  activeDistrict,
}) => {
  const [selectedDepot, setSelectedDepot] = useState<ReliefDepot>(depots[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockModalItem, setStockModalItem] = useState<{ depotId: string; itemName: string; current: number; unit: string } | null>(null);
  const [adjustmentDelta, setAdjustmentDelta] = useState<number>(500);
  const [isReceiving, setIsReceiving] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const filteredDepots = activeDistrict === 'All Districts'
    ? depots
    : depots.filter((d) => d.district.toLowerCase() === activeDistrict.toLowerCase());

  const currentDepot = filteredDepots.find((d) => d.id === selectedDepot?.id) || filteredDepots[0] || depots[0];

  const handleStockAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockModalItem) return;

    const delta = isReceiving ? Math.abs(adjustmentDelta) : -Math.abs(adjustmentDelta);
    const success = StorageEngine.updateDepotStock(stockModalItem.depotId, stockModalItem.itemName, delta);

    if (success) {
      setFeedback(`Inventory successfully adjusted: ${isReceiving ? '+' : ''}${delta} ${stockModalItem.unit} of ${stockModalItem.itemName}.`);
      setStockModalItem(null);
      onInventoryChanged();
    } else {
      setFeedback(`Adjustment failed: Insufficient stock. Cannot reduce inventory below zero.`);
    }
  };

  const inventoryItems = currentDepot ? currentDepot.inventory.filter((item) => {
    if (!searchQuery.trim()) return true;
    return item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.category.toLowerCase().includes(searchQuery.toLowerCase());
  }) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Package className="w-5 h-5 text-emerald-600" />
            <span>Relief Depots &amp; Stock Logistics</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time warehousing, buffer thresholds, and verified stock adjustment audit trail.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-600">Active Depot:</span>
          <select
            value={currentDepot?.id}
            onChange={(e) => {
              const matched = depots.find((d) => d.id === e.target.value);
              if (matched) setSelectedDepot(matched);
            }}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-800"
          >
            {filteredDepots.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.district})
              </option>
            ))}
          </select>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Selected Depot Overview Card */}
      {currentDepot && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Depot Facility</span>
            <h3 className="font-bold text-sm text-slate-900 mt-0.5">{currentDepot.name}</h3>
            <p className="text-slate-500 flex items-center space-x-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{currentDepot.location}</span>
            </p>
          </div>

          <div>
            <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Custodian Officer</span>
            <p className="font-semibold text-slate-800 mt-0.5">{currentDepot.contactPerson}</p>
            <p className="text-slate-500 flex items-center space-x-1 mt-1 font-mono">
              <PhoneCall className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{currentDepot.contactPhone}</span>
            </p>
          </div>

          <div className="flex items-center justify-start md:justify-end">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Tracked SKUs</span>
              <p className="text-xl font-black text-slate-900">{currentDepot.inventory.length}</p>
              <p className="text-[10px] text-amber-700 font-semibold">
                {currentDepot.inventory.filter((i) => i.quantity <= i.reorderThreshold).length} items below threshold
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-md">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search inventory items or category..."
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
      </div>

      {/* Inventory Items Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-3.5">SKU / Item Name</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">In Stock Qty</th>
                <th className="p-3.5">Reorder Warning Threshold</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Last Logged</th>
                <th className="p-3.5 text-right">Adjust Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inventoryItems.map((item) => {
                const isLow = item.quantity <= item.reorderThreshold;
                const percent = Math.min(100, Math.round((item.quantity / (item.reorderThreshold * 2.5)) * 100));
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{item.id}</div>
                    </td>
                    <td className="p-3.5 text-slate-600 font-medium">{item.category}</td>
                    <td className="p-3.5">
                      <span className="text-sm font-mono font-bold text-slate-900">
                        {item.quantity.toLocaleString()}
                      </span>{' '}
                      <span className="text-slate-500 font-medium">{item.unit}</span>
                      {/* Visual stock bar */}
                      <div className="w-24 bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isLow ? 'bg-rose-500' : 'bg-emerald-500'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-600">
                      {item.reorderThreshold.toLocaleString()} {item.unit}
                    </td>
                    <td className="p-3.5">
                      {isLow ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-800 flex items-center space-x-1 w-fit">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Low Stock Alert</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                          Adequate Reserve
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-400 font-mono text-[11px]">{item.lastUpdated}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() =>
                          setStockModalItem({
                            depotId: currentDepot.id,
                            itemName: item.name,
                            current: item.quantity,
                            unit: item.unit,
                          })
                        }
                        className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 rounded-lg font-bold text-[11px] transition cursor-pointer"
                      >
                        Adjust / Consign
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {stockModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <form
            onSubmit={handleStockAdjust}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Log Stock Adjustment / Receipt
              </h3>
              <button
                type="button"
                onClick={() => setStockModalItem(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <p className="font-semibold text-slate-800">{stockModalItem.itemName}</p>
              <p className="text-slate-500">
                Current Inventory: <strong>{stockModalItem.current} {stockModalItem.unit}</strong>
              </p>
            </div>

            <div className="flex rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setIsReceiving(true)}
                className={`flex-1 py-1.5 rounded-lg font-bold text-xs cursor-pointer ${
                  isReceiving ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-500'
                }`}
              >
                + Receive Inbound Consignment
              </button>
              <button
                type="button"
                onClick={() => setIsReceiving(false)}
                className={`flex-1 py-1.5 rounded-lg font-bold text-xs cursor-pointer ${
                  !isReceiving ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-500'
                }`}
              >
                - Outbound Relief Dispatch
              </button>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Quantity to {isReceiving ? 'Add' : 'Deduct'} ({stockModalItem.unit}) *
              </label>
              <input
                type="number"
                min={1}
                value={adjustmentDelta}
                onChange={(e) => setAdjustmentDelta(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                New resulting inventory will be:{' '}
                <strong>
                  {isReceiving
                    ? stockModalItem.current + adjustmentDelta
                    : stockModalItem.current - adjustmentDelta}{' '}
                  {stockModalItem.unit}
                </strong>
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStockModalItem(null)}
                className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer"
              >
                Save Adjustment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import {
  Smartphone,
  Plus,
  Wifi,
  WifiOff,
  Battery,
  Signal,
  X,
  RefreshCw,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

function BatteryBar({ level }: { level?: number | null }) {
  if (level == null) return <span className="text-xs text-dark-400">N/A</span>;
  const color =
    level > 50 ? 'bg-brand-500' : level > 20 ? 'bg-warning' : 'bg-error';
  return (
    <div className="flex items-center gap-1.5">
      <Battery className="w-3.5 h-3.5 text-dark-400" />
      <div className="w-16 h-2 bg-surface-cool rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${level}%` }} />
      </div>
      <span className="text-xs text-dark-500">{level}%</span>
    </div>
  );
}

function SignalBars({ strength }: { strength?: number | null }) {
  if (strength == null) return <span className="text-xs text-dark-400">N/A</span>;
  const bars = Math.min(4, Math.max(0, strength));
  return (
    <div className="flex items-end gap-0.5">
      <Signal className="w-3.5 h-3.5 text-dark-400 mr-0.5" />
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`w-1 rounded-sm ${i <= bars ? 'bg-brand-500' : 'bg-surface-cool'}`}
          style={{ height: `${i * 3 + 3}px` }}
        />
      ))}
    </div>
  );
}

function DeviceCard({ device, onRemove }: { device: any; onRemove: (id: string) => void }) {
  const isOnline = device.status === 'ONLINE';
  return (
    <Card className="relative group p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isOnline ? 'bg-brand-50' : 'bg-surface-warm'}`}>
            <Smartphone className={`w-5 h-5 ${isOnline ? 'text-brand-600' : 'text-dark-400'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-dark-900 text-sm">{device.name}</h3>
            <p className="text-xs text-dark-400">{device.model}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isOnline ? 'green' : 'gray'}>
            {isOnline ? (
              <><Wifi className="w-3 h-3" /> ONLINE</>
            ) : (
              <><WifiOff className="w-3 h-3" /> OFFLINE</>
            )}
          </Badge>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-dark-500">Battery</span>
          <BatteryBar level={device.batteryLevel} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-dark-500">Signal</span>
          <SignalBars strength={device.signalStrength} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-dark-500">SIM slots</span>
          <span className="text-xs font-medium text-dark-700">{device.simCount}</span>
        </div>
        {device.lastSeenAt && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-dark-500">Last seen</span>
            <span className="text-xs text-dark-400">
              {new Date(device.lastSeenAt).toLocaleString()}
            </span>
          </div>
        )}
      </div>

      <button
        onClick={() => onRemove(device.id)}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50 text-dark-400 hover:text-error"
        title="Remove device"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </Card>
  );
}

export default function DevicesPage() {
  const [showPairDialog, setShowPairDialog] = useState(false);
  const [qrData, setQrData] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: devices = [], isLoading } = useQuery({
    queryKey: ['devices'],
    queryFn: () => apiClient.get('/devices').then((r) => r.data),
    refetchInterval: 10000,
  });

  const pairMutation = useMutation({
    mutationFn: () => apiClient.post('/devices/pair/generate').then((r) => r.data),
    onSuccess: (data) => {
      setQrData(JSON.stringify(data.qrData));
      setShowPairDialog(true);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/devices/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });

  const handleOpenPair = useCallback(() => {
    pairMutation.mutate();
  }, [pairMutation]);

  const handleCloseDialog = () => {
    setShowPairDialog(false);
    setQrData(null);
    queryClient.invalidateQueries({ queryKey: ['devices'] });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-dark-900">Devices</h1>
          <p className="text-sm text-dark-500 mt-0.5">
            Manage your connected Android devices.
          </p>
        </div>
        <button
          onClick={handleOpenPair}
          disabled={pairMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-md transition-colors shadow-sm disabled:opacity-60"
        >
          <Plus className="w-4 h-4" />
          Add device
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-52" />)}
        </div>
      ) : devices.length === 0 ? (
        <Card className="py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-7 h-7 text-brand-500" />
          </div>
          <h3 className="font-semibold text-dark-800 mb-2">No devices connected</h3>
          <p className="text-sm text-dark-400 max-w-xs mx-auto mb-6">
            Connect your Android phone to start sending SMS messages.
          </p>
          <button
            onClick={handleOpenPair}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add your first device
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((device: any) => (
            <DeviceCard
              key={device.id}
              device={device}
              onRemove={(id) => removeMutation.mutate(id)}
            />
          ))}
        </div>
      )}

      {/* Pairing Dialog */}
      {showPairDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-sm w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-dark-900">Scan QR Code</h2>
              <button
                onClick={handleCloseDialog}
                className="p-1 rounded hover:bg-surface-warm text-dark-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {qrData ? (
              <>
                <div className="flex justify-center mb-6">
                  <div className="p-4 border-2 border-brand-200 rounded-xl bg-white">
                    <QRCodeSVG value={qrData} size={200} level="H" />
                  </div>
                </div>
                <p className="text-sm text-center text-dark-500 mb-4">
                  Open the <strong>SMSFlow</strong> app on your Android device and scan this QR code.
                </p>
                <div className="flex items-center gap-2 text-xs text-dark-400 justify-center">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Waiting for device to connect...
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 text-brand-500 animate-spin" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const LEAD_COLORS = {
  new: '#7C8CF8',
  contacted: '#E8B24E',
  qualified: '#4FA8E8',
  proposal: '#F08A5D',
  negotiation: '#C97BE0',
  won: '#4FAE7E',
  lost: '#E1615E',
};

const DEAL_COLORS = {
  discovery: '#7C8CF8',
  proposal: '#E8B24E',
  negotiation: '#F08A5D',
  closed_won: '#4FAE7E',
  closed_lost: '#E1615E',
};

export function LeadStatusBadge({ status }) {
  const color = LEAD_COLORS[status] || '#999';
  return (
    <span
      className="badge capitalize"
      style={{ backgroundColor: `${color}1A`, color }}
    >
      {status}
    </span>
  );
}

export function DealStageBadge({ stage }) {
  const color = DEAL_COLORS[stage] || '#999';
  return (
    <span className="badge capitalize" style={{ backgroundColor: `${color}1A`, color }}>
      {stage?.replace('_', ' ')}
    </span>
  );
}

export function RoleBadge({ role }) {
  const color = role === 'admin' ? '#DE9A2B' : '#4FA8E8';
  return (
    <span className="badge capitalize" style={{ backgroundColor: `${color}1A`, color }}>
      {role}
    </span>
  );
}

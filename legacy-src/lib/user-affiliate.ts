import userAffiliateRaw from "../data/user-affiliate.json";

type RawUserAffiliate = typeof userAffiliateRaw;

const data = userAffiliateRaw as RawUserAffiliate;

export type UserAffiliateData = ReturnType<typeof loadUserAffiliateData>;
export type AffiliateMember = UserAffiliateData["members"][number];
export type AffiliateOrder = UserAffiliateData["orders"][number];
export type AffiliatePayout = UserAffiliateData["payouts"][number];

export function loadUserAffiliateData() {
  return {
    summary: {
      title: data.summary.title,
      description: data.summary.description,
      status: data.summary.status,
      referralCode: data.summary.referral_code,
      referralUrl: data.summary.referral_url,
      availableBalance: data.summary.available_balance,
      pendingCommission: data.summary.pending_commission,
      lifetimeCommission: data.summary.lifetime_commission,
      currency: data.summary.currency,
    },
    stats: data.stats,
    members: data.members.map((member) => ({
      id: member.id,
      name: member.name,
      phone: member.phone,
      joinedAt: member.joined_at,
      status: member.status,
      orders: member.orders,
      sales: member.sales,
      commission: member.commission,
    })),
    orders: data.orders.map((order) => ({
      id: order.id,
      orderId: order.order_id,
      memberName: order.member_name,
      customerName: order.customer_name,
      status: order.status,
      orderedAt: order.ordered_at,
      total: order.total,
      commission: order.commission,
    })),
    payouts: data.payouts.map((payout) => ({
      id: payout.id,
      requestId: payout.request_id,
      method: payout.method,
      account: payout.account,
      status: payout.status,
      requestedAt: payout.requested_at,
      amount: payout.amount,
    })),
  };
}

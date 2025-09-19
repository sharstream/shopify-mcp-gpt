export const ABANDONMENT_UPDATE_ACTIVITIES_DELIVERY_STATUSES_MUTATION = `
mutation abandonmentUpdateActivitiesDeliveryStatuses(
  $abandonmentId: ID!
  $marketingActivityId: ID!
  $deliveryStatus: AbandonmentDeliveryState!
  $deliveredAt: DateTime
  $deliveryStatusChangeReason: String
) {
  abandonmentUpdateActivitiesDeliveryStatuses(
    abandonmentId: $abandonmentId
    marketingActivityId: $marketingActivityId
    deliveryStatus: $deliveryStatus
    deliveredAt: $deliveredAt
    deliveryStatusChangeReason: $deliveryStatusChangeReason
  ) {
    abandonment {
      id
    }
    userErrors {
      code
      field
      message
    }
  }
}
`;

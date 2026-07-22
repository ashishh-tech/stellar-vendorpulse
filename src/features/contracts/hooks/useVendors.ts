import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SorobanContractService } from '../service';
import { RegisterVendorInput, SubmitReviewInput } from '../types';

export function useVendors() {
  return useQuery({
    queryKey: ['vendors'],
    queryFn: () => SorobanContractService.listVendors(),
    staleTime: 10000,
  });
}

export function useVendorReviews(vendorId: number) {
  return useQuery({
    queryKey: ['vendor-reviews', vendorId],
    queryFn: () => SorobanContractService.getVendorReviews(vendorId),
    enabled: !!vendorId,
  });
}

export function useRegisterVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RegisterVendorInput) => SorobanContractService.registerVendor(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SubmitReviewInput) => SorobanContractService.submitReview(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-reviews', variables.vendorId] });
    },
  });
}

export function useUpdateVendorStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vendorId, status }: { vendorId: number; status: string }) =>
      SorobanContractService.updateVendorStatus(vendorId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}

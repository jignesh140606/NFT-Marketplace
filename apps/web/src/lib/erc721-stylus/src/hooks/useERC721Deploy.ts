/**
 * React hook for deploying ERC721 NFT collections
 */

import { useState, useCallback } from 'react';
import { getRpcEndpoint, getFactoryAddress, deployERC721CollectionViaAPI } from '../deployment';
import type { 
  UseERC721DeployOptions, 
  UseERC721DeployReturn, 
  DeploymentState, 
  DeployCollectionParams,
  DeployCollectionResult,
} from '../types';

const DEFAULT_DEPLOYMENT_API_URL = 'http://localhost:4001';

export function useERC721Deploy(options: UseERC721DeployOptions): UseERC721DeployReturn {
  const { 
    privateKey, 
    rpcEndpoint, 
    network,
    deploymentApiUrl = DEFAULT_DEPLOYMENT_API_URL,
  } = options;

  const [deploymentState, setDeploymentState] = useState<DeploymentState>({ status: 'idle' });
  const [error, setError] = useState<Error | null>(null);

  const actualRpcEndpoint = rpcEndpoint || getRpcEndpoint(network);
  const factoryAddress = getFactoryAddress(network);

  const deployCollection = useCallback(async (params: DeployCollectionParams): Promise<DeployCollectionResult> => {
    if (!privateKey) {
      throw new Error('Private key is required for deployment');
    }

    setError(null);
    setDeploymentState({ status: 'deploying' });

    try {
      // Deploy via API
      const result = await deployERC721CollectionViaAPI({
        ...params,
        factoryAddress: params.factoryAddress || factoryAddress,
        privateKey,
        rpcEndpoint: actualRpcEndpoint,
        deploymentApiUrl,
      });

      setDeploymentState({ status: 'success', result });
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setDeploymentState({ status: 'error', error });
      throw error;
    }
  }, [privateKey, actualRpcEndpoint, factoryAddress, deploymentApiUrl]);

  const reset = useCallback(() => {
    setDeploymentState({ status: 'idle' });
    setError(null);
  }, []);

  return {
    deployCollection,
    deploymentState,
    isDeploying: deploymentState.status === 'deploying' || 
                 deploymentState.status === 'activating' ||
                 deploymentState.status === 'initializing' ||
                 deploymentState.status === 'registering',
    error,
    reset,
  };
}

import logging

import algokit_utils

logger = logging.getLogger(__name__)


def deploy() -> None:
    from smart_contracts.artifacts.retirement_manager.retirement_manager_client import (
        RetirementManagerFactory,
        RetirementManagerMethodCallCreateParams,
        RetireCreditsArgs,
    )

    algorand = algokit_utils.AlgorandClient.from_environment()
    deployer_ = algorand.account.from_environment("DEPLOYER")

    factory = algorand.client.get_typed_app_factory(
        RetirementManagerFactory, default_sender=deployer_.address
    )

    app_client, result = factory.deploy(
        on_update=algokit_utils.OnUpdate.AppendApp,
        on_schema_break=algokit_utils.OnSchemaBreak.AppendApp,
        create_params=RetirementManagerMethodCallCreateParams(method="create()void"),
    )

    if result.operation_performed in [
        algokit_utils.OperationPerformed.Create,
        algokit_utils.OperationPerformed.Replace,
    ]:
        algorand.send.payment(
            algokit_utils.PaymentParams(
                amount=algokit_utils.AlgoAmount(algo=1),
                sender=deployer_.address,
                receiver=app_client.app_address,
            )
        )

    # Retire some credits as a smoke test
    response = app_client.send.retire_credits(
        args=RetireCreditsArgs(amount=100)
    )
    logger.info(
        f"Retired 100 credits on {app_client.app_name} ({app_client.app_id}), "
        f"txn: {response.tx_ids}"
    )

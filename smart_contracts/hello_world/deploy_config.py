import logging

import algokit_utils

logger = logging.getLogger(__name__)


# define deployment behaviour based on supplied app spec
def deploy() -> None:
    from smart_contracts.artifacts.hello_world.carbon_x_client import (
        CarbonXFactory,
        MintCreditsArgs,
        RegisterProjectArgs,
    )

    algorand = algokit_utils.AlgorandClient.from_environment()
    deployer_ = algorand.account.from_environment("DEPLOYER")

    factory = algorand.client.get_typed_app_factory(
        CarbonXFactory, default_sender=deployer_.address
    )

    app_client, result = factory.deploy(
        on_update=algokit_utils.OnUpdate.AppendApp,
        on_schema_break=algokit_utils.OnSchemaBreak.AppendApp,
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

    # Register a demo project
    response = app_client.send.register_project(
        args=RegisterProjectArgs(name="CarbonX Demo")
    )
    logger.info(
        f"Registered project on {app_client.app_name} ({app_client.app_id}), "
        f"txn: {response.tx_ids}"
    )

    # Mint initial credits
    response = app_client.send.mint_credits(
        args=MintCreditsArgs(amount=1000)
    )
    logger.info(
        f"Minted 1000 credits on {app_client.app_name} ({app_client.app_id}), "
        f"txn: {response.tx_ids}"
    )

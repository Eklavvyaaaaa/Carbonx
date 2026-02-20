import logging

import algokit_utils

logger = logging.getLogger(__name__)


def deploy() -> None:
    from smart_contracts.artifacts.issuer_registry.issuer_registry_client import (
        IssuerRegistryFactory,
        IssuerRegistryMethodCallCreateParams,
    )

    algorand = algokit_utils.AlgorandClient.from_environment()
    deployer_ = algorand.account.from_environment("DEPLOYER")

    factory = algorand.client.get_typed_app_factory(
        IssuerRegistryFactory, default_sender=deployer_.address
    )

    app_client, result = factory.deploy(
        on_update=algokit_utils.OnUpdate.AppendApp,
        on_schema_break=algokit_utils.OnSchemaBreak.AppendApp,
        create_params=IssuerRegistryMethodCallCreateParams(method="create()void"),
    )

    # Always ensure the contract has enough ALGO for MBR (at least 0.5 ALGO)
    try:
        app_info = algorand.account.get_information(app_client.app_address)
        if app_info.amount < 500_000:
            logger.info(f"Funding {app_client.app_name} with 1 ALGO for MBR")
            algorand.send.payment(
                algokit_utils.PaymentParams(
                    amount=algokit_utils.AlgoAmount(algo=1),
                    sender=deployer_.address,
                    receiver=app_client.app_address,
                )
            )
    except Exception as e:
        logger.warning(f"Could not verify/fund contract: {e}")

    logger.info(
        f"Deployed {app_client.app_name} ({app_client.app_id}) successfully"
    )

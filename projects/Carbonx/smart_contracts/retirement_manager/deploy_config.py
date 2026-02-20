import logging
import os
import algokit_utils

logger = logging.getLogger(__name__)


def deploy() -> None:
    from smart_contracts.artifacts.retirement_manager.retirement_manager_client import (
        RetirementManagerFactory,
        RetirementManagerMethodCallCreateParams,
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

    # Initialize with $CXT ASA if provided
    cxt_asset_id = int(os.getenv("CXT_ASSET_ID", 0))
    if cxt_asset_id != 0:
        try:
            current_asset_id = app_client.state.global_state.cxt_asset_id
            
            if current_asset_id == 0:
                logger.info(f"Initializing {app_client.app_name} with $CXT ASA {cxt_asset_id}")
                app_client.send.init_asset(
                    args=(cxt_asset_id,),
                    params=algokit_utils.CommonAppCallParams(
                        asset_references=[cxt_asset_id],
                        extra_fee=algokit_utils.AlgoAmount(micro_algo=1000)
                    )
                )
                logger.info(f"Successfully initialized {app_client.app_name} with ASA {cxt_asset_id}")
            else:
                logger.info(f"{app_client.app_name} already initialized with ASA {current_asset_id}")
        except Exception as e:
            logger.warning(f"Could not initialize asset: {e}")

    logger.info(
        f"Deployed {app_client.app_name} ({app_client.app_id}) successfully"
    )

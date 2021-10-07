package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.OrganizationQueueItem;
import java.util.List;
import org.springframework.data.jpa.repository.Query;

public interface OrganizationQueueRepository
    extends EternalAuditedEntityRepository<OrganizationQueueItem> {

  @Query(EternalAuditedEntityRepository.BASE_QUERY + " and e.verifiedOrganization IS NULL")
  List<OrganizationQueueItem> findAllNotIdentityVerified();
}
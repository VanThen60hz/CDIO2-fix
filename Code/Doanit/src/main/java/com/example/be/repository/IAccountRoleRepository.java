package com.example.be.repository;


import com.example.be.entity.Account;
import com.example.be.entity.AccountRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.util.List;

@Transactional
@Repository
public interface IAccountRoleRepository extends JpaRepository<AccountRole, Integer> {

    List<AccountRole> findAllByAccount(Account account);


    @Modifying
    @Query(value = "insert  into account_role(account_id, role_id)" + " value (?1,?2)",nativeQuery = true)
    void createAccountRole(Integer accountId, Integer roleId);

}
